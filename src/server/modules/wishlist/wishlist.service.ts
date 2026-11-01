import "server-only";
import type { Locale } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { newToken } from "../../lib/guest-token";
import { listProductCards } from "../catalog/catalog.service";

/** Product ids on the wishlist (drives the heart icons). */
export async function wishlistProductIds(token: string | null): Promise<string[]> {
  if (!token) return [];
  const list = await prisma.wishlist.findUnique({
    where: { token },
    select: { items: { select: { productId: true }, orderBy: { createdAt: "desc" } } },
  });
  return list?.items.map((i) => i.productId) ?? [];
}

/** Wishlist products as cards, in one language (newest first). */
export async function wishlistCards(token: string | null, locale: Locale) {
  const ids = await wishlistProductIds(token);
  return listProductCards(locale, ids);
}

/**
 * Adds or removes a product. Returns the (possibly new) token and the new state. Like the cart,
 * a signed-in customer's list is linked to the account.
 */
export async function toggleWishlist(
  token: string | null,
  productId: string,
  userId: string | null = null,
) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!product) throw new ApiError(404, "notFound");

  const found =
    (token ? await prisma.wishlist.findUnique({ where: { token } }) : null) ??
    (userId ? await prisma.wishlist.findFirst({ where: { userId } }) : null);
  const list = found
    ? userId && !found.userId
      ? await prisma.wishlist.update({ where: { id: found.id }, data: { userId } })
      : found
    : await prisma.wishlist.create({ data: { token: newToken(), userId } });

  const key = { wishlistId_productId: { wishlistId: list.id, productId } };
  const existing = await prisma.wishlistItem.findUnique({ where: key });
  if (existing) await prisma.wishlistItem.delete({ where: key });
  else await prisma.wishlistItem.create({ data: { wishlistId: list.id, productId } });

  return { token: list.token, saved: !existing };
}
