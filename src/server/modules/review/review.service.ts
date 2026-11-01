import "server-only";
import type { Locale, ReviewStatus } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { pagination } from "../../http/response";
import { cached, invalidate, TAGS } from "../../lib/cache";

// ─── Customer ────────────────────────────────────────────────────────────────

/** Products the user received (delivered orders) and has not reviewed yet. */
export async function reviewableProducts(userId: string, locale: Locale) {
  const items = await prisma.orderItem.findMany({
    where: { productId: { not: null }, order: { userId, status: "DELIVERED" } },
    select: {
      productId: true,
      nameBn: true,
      nameEn: true,
      imageUrl: true,
      order: { select: { number: true } },
    },
    orderBy: { order: { createdAt: "desc" } },
  });
  const reviewed = new Set(
    (await prisma.review.findMany({ where: { userId }, select: { productId: true } })).map(
      (r) => r.productId,
    ),
  );
  const seen = new Set<string>();
  return items.flatMap((i) => {
    if (!i.productId || reviewed.has(i.productId) || seen.has(i.productId)) return [];
    seen.add(i.productId);
    return [
      {
        productId: i.productId,
        name: locale === "bn" ? i.nameBn : i.nameEn,
        image: i.imageUrl,
        orderNumber: i.order.number,
      },
    ];
  });
}

/** Verified purchase only. New reviews wait for moderation. */
export async function createReview(
  userId: string,
  locale: Locale,
  input: { productId: string; rating: number; body: string },
) {
  const item = await prisma.orderItem.findFirst({
    where: { productId: input.productId, order: { userId, status: "DELIVERED" } },
    select: { orderId: true },
  });
  if (!item) throw new ApiError(403, "reviewNotAllowed");
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId: input.productId } },
    select: { id: true },
  });
  if (existing) throw new ApiError(409, "alreadyReviewed");
  await prisma.review.create({
    data: {
      userId,
      productId: input.productId,
      orderId: item.orderId,
      rating: input.rating,
      body: input.body,
      locale,
    },
  });
}

/** Approved reviews for the product page (all languages — a review is shown as written). */
async function productReviewsDb(productId: string, take = 20) {
  const [items, stats] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        rating: true,
        body: true,
        locale: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.review.aggregate({
      where: { productId, status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    }),
  ]);
  return {
    average: stats._avg.rating ?? 0,
    count: stats._count,
    items: items.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      locale: r.locale,
      createdAt: r.createdAt,
      // First name only on the public page.
      author: r.user.name.split(" ")[0] ?? "",
    })),
  };
}

export type ProductReviews = Awaited<ReturnType<typeof productReviewsDb>>;

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function listReviews(query: { page?: number; limit?: number; status?: ReviewStatus }) {
  const { skip, take, meta } = pagination(query);
  const where = { status: query.status };
  const [rows, total, pending] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { translations: { where: { locale: "en" }, select: { name: true } } } },
        order: { select: { number: true } },
      },
    }),
    prisma.review.count({ where }),
    prisma.review.count({ where: { status: "PENDING" } }),
  ]);
  return {
    items: rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product.translations[0]?.name ?? "",
      rating: r.rating,
      body: r.body,
      locale: r.locale,
      status: r.status,
      createdAt: r.createdAt,
      author: r.user.name,
      authorEmail: r.user.email,
      orderNumber: r.order.number,
    })),
    meta: meta(total),
    pending,
  };
}

export type AdminReview = Awaited<ReturnType<typeof listReviews>>["items"][number];

export async function setReviewStatus(id: string, status: ReviewStatus) {
  const found = await prisma.review.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.review.update({ where: { id }, data: { status } });
  invalidate(TAGS.reviews);
}

export async function deleteReview(id: string) {
  const found = await prisma.review.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.review.delete({ where: { id } });
  invalidate(TAGS.reviews);
}

/** Approved reviews + rating (cached; invalidated when staff moderate). */
export const productReviews = cached(productReviewsDb, "reviews:product", [TAGS.reviews]);
