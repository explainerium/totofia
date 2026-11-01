import "server-only";
import type { Locale, Prisma } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { effectivePrice } from "../../domain/pricing/effective-price";
import { ApiError } from "../../http/api-error";
import { GUEST_TTL_MS, newToken } from "../../lib/guest-token";
import { imageUrls } from "../media/media.service";
import { MAX_LINE_QUANTITY } from "./cart.schema";

// ─── Loading ─────────────────────────────────────────────────────────────────

const itemInclude = (locale: Locale) =>
  ({
    variant: {
      include: {
        image: true,
        attributeValues: {
          include: {
            attributeValue: {
              include: { translations: true, attribute: { select: { sortOrder: true } } },
            },
          },
        },
        product: {
          include: {
            translations: { where: { locale } },
            featuredImage: true,
          },
        },
      },
    },
  }) satisfies Prisma.CartItemInclude;

type ItemRow = Prisma.CartItemGetPayload<{ include: ReturnType<typeof itemInclude> }>;

/** "0–3 Months · Sage" in the requested language (attribute order). */
export function variantLabel(item: Pick<ItemRow, "variant">, locale: Locale): string {
  return [...item.variant.attributeValues]
    .sort((a, b) => a.attributeValue.attribute.sortOrder - b.attributeValue.attribute.sortOrder)
    .map(
      (a) =>
        a.attributeValue.translations.find((t) => t.locale === locale)?.label ??
        a.attributeValue.code,
    )
    .join(" · ");
}

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  sku: string;
  image: string | null;
  unitPrice: number;
  compareAt: number | null;
  quantity: number;
  lineTotal: number;
  stock: number;
  /** false when the product was unpublished, the variant disabled or it sold out. */
  available: boolean;
};

export type CartView = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  couponCode: string | null;
};

const EMPTY: CartView = { items: [], itemCount: 0, subtotal: 0, couponCode: null };

function toLine(item: ItemRow, locale: Locale): CartLine | null {
  const { variant } = item;
  const t = variant.product.translations[0];
  if (!t) return null; // no translation in this language → not shown (strict language rule)
  const price = effectivePrice({
    price: Number(variant.price),
    salePrice: variant.salePrice === null ? null : Number(variant.salePrice),
    saleStartsAt: variant.saleStartsAt,
    saleEndsAt: variant.saleEndsAt,
  });
  const image = variant.image ?? variant.product.featuredImage;
  const available =
    variant.isActive && variant.product.status === "PUBLISHED" && variant.stock >= item.quantity;

  return {
    variantId: variant.id,
    productId: variant.productId,
    slug: t.slug,
    name: t.name,
    variantLabel: variantLabel(item, locale),
    sku: variant.sku,
    image: image ? imageUrls(image).thumb : null,
    unitPrice: price.price,
    compareAt: price.compareAt,
    quantity: item.quantity,
    lineTotal: price.price * item.quantity,
    stock: variant.stock,
    available,
  };
}

/** Priced lines for arbitrary variants (admin manual orders), same shape as cart lines. */
export async function linesForVariants(
  locale: Locale,
  items: { variantId: string; quantity: number }[],
): Promise<CartLine[]> {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: itemInclude(locale).variant.include,
  });
  return items.flatMap((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    const line = variant ? toLine({ quantity: item.quantity, variant } as ItemRow, locale) : null;
    return line ? [line] : [];
  });
}

export async function getCartView(token: string | null, locale: Locale): Promise<CartView> {
  if (!token) return EMPTY;
  const cart = await prisma.cart.findUnique({
    where: { token },
    include: { items: { include: itemInclude(locale), orderBy: { createdAt: "asc" } } },
  });
  if (!cart || cart.expiresAt < new Date()) return EMPTY;

  const items = cart.items.map((i) => toLine(i, locale)).filter((l): l is CartLine => l !== null);
  const payable = items.filter((i) => i.available);
  return {
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: payable.reduce((sum, i) => sum + i.lineTotal, 0),
    couponCode: cart.couponCode,
  };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Returns the cart for the token, creating one (and a token) when needed. A signed-in
 * customer's cart is linked to the account (it comes back at the next sign-in, on any device);
 * without a cookie their latest account cart is reused.
 */
async function ensureCart(token: string | null, userId: string | null) {
  const expiresAt = new Date(Date.now() + GUEST_TTL_MS);
  const existing =
    (token ? await prisma.cart.findUnique({ where: { token } }) : null) ??
    (userId
      ? await prisma.cart.findFirst({
          where: { userId, expiresAt: { gt: new Date() } },
          orderBy: { updatedAt: "desc" },
        })
      : null);
  if (existing) {
    return prisma.cart.update({
      where: { id: existing.id },
      data: { expiresAt, ...(userId && !existing.userId ? { userId } : {}) },
    });
  }
  return prisma.cart.create({ data: { token: newToken(), expiresAt, userId } });
}

async function purchasableVariant(variantId: string) {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, isActive: true, product: { status: "PUBLISHED" } },
    select: { id: true, stock: true },
  });
  if (!variant) throw new ApiError(404, "variantUnavailable");
  return variant;
}

function assertStock(stock: number, quantity: number) {
  if (stock <= 0) throw new ApiError(409, "outOfStock");
  if (quantity > stock) throw new ApiError(409, "insufficientStock", { available: stock });
}

/** Adds to the existing line (capped at MAX_LINE_QUANTITY). Returns the (possibly new) token. */
export async function addItem(
  token: string | null,
  variantId: string,
  quantity: number,
  userId: string | null = null,
) {
  const variant = await purchasableVariant(variantId);
  const cart = await ensureCart(token, userId);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });
  const next = Math.min(MAX_LINE_QUANTITY, (existing?.quantity ?? 0) + quantity);
  assertStock(variant.stock, next);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, quantity: next },
    update: { quantity: next },
  });
  return cart.token;
}

/** Quantity 0 removes the line. */
export async function setQuantity(token: string | null, variantId: string, quantity: number) {
  const cart = token ? await prisma.cart.findUnique({ where: { token } }) : null;
  if (!cart) throw new ApiError(404, "notFound");
  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
    return;
  }
  const variant = await purchasableVariant(variantId);
  assertStock(variant.stock, quantity);
  const { count } = await prisma.cartItem.updateMany({
    where: { cartId: cart.id, variantId },
    data: { quantity },
  });
  if (count === 0) throw new ApiError(404, "notFound");
}

export async function setCoupon(token: string | null, code: string | null) {
  const cart = token ? await prisma.cart.findUnique({ where: { token } }) : null;
  if (!cart) throw new ApiError(404, "cartEmpty");
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: code } });
}

/** Deletes expired guest carts (cron, Phase 6). */
export async function purgeExpiredCarts() {
  const { count } = await prisma.cart.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}
