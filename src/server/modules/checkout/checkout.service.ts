import "server-only";
import type { Coupon, Locale, Prisma } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { computeTotals, couponProblem } from "../../domain/checkout/totals";
import { ApiError } from "../../http/api-error";
import { afterResponse } from "../../lib/after-response";
import { newToken } from "../../lib/guest-token";
import { getCartView, variantLabel, type CartLine } from "../cart/cart.service";
import { findCouponByCode, phoneRedemptions, toRule } from "../coupon/coupon.service";
import { imageUrls } from "../media/media.service";
import { sendOrderPlacedEmails } from "../order/order.mail";
import { getStoreSettings } from "../setting/setting.service";
import { zoneForDistrict } from "../shipping/shipping.service";
import type { CheckoutInput } from "./checkout.schema";
import { invalidate, TAGS } from "../../lib/cache";

type CouponState = { code: string; problem: string | null; coupon: Coupon | null };

async function resolveCoupon(code: string | null, subtotal: number, phone?: string) {
  if (!code) return null;
  const coupon = await findCouponByCode(code);
  if (!coupon) return { code, problem: "couponNotFound", coupon: null } satisfies CouponState;
  const phoneUses = phone ? await phoneRedemptions(coupon.id, phone) : undefined;
  const problem = couponProblem(toRule(coupon), { subtotal, phoneUses });
  return { code: coupon.code, problem, coupon } satisfies CouponState;
}

// ─── Preview ─────────────────────────────────────────────────────────────────

export async function previewCheckout(
  token: string | null,
  locale: Locale,
  input: { district?: string; phone?: string },
) {
  const cart = await getCartView(token, locale);
  const zone = input.district ? await zoneForDistrict(input.district) : null;
  const coupon = await resolveCoupon(cart.couponCode, cart.subtotal, input.phone);
  const validCoupon = coupon && !coupon.problem && coupon.coupon ? toRule(coupon.coupon) : null;

  return {
    cart,
    zone: zone
      ? {
          code: zone.code,
          name: zone.name[locale],
          minDays: zone.minDays,
          maxDays: zone.maxDays,
          freeAboveSubtotal: zone.freeAboveSubtotal,
        }
      : null,
    coupon: coupon ? { code: coupon.code, problem: coupon.problem } : null,
    totals: computeTotals({
      subtotal: cart.subtotal,
      zone: zone ? { fee: zone.fee, freeAboveSubtotal: zone.freeAboveSubtotal } : null,
      coupon: validCoupon,
    }),
  };
}

export type CheckoutPreview = Awaited<ReturnType<typeof previewCheckout>>;

/** Coupon check used by "apply coupon" in the cart (no phone known yet). */
export async function checkCoupon(code: string, subtotal: number) {
  const state = await resolveCoupon(code, subtotal);
  if (!state || state.problem || !state.coupon) {
    throw new ApiError(400, (state?.problem ?? "couponNotFound") as "couponNotFound");
  }
  return state.coupon.code;
}

// ─── Place order ─────────────────────────────────────────────────────────────

export type OrderCustomer = {
  name: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  note?: string;
};

type CreateOrderParams = {
  lines: CartLine[];
  locale: Locale;
  customer: OrderCustomer;
  paymentMethod: "COD" | "SSLCOMMERZ" | "AAMARPAY";
  couponCode: string | null;
  userId: string | null;
  source: "WEB" | "ADMIN";
  /** Staff name for the first history entry (manual orders). */
  actorName?: string;
  /** Manual orders may override the zone fee (e.g. pickup = 0). */
  shippingFeeOverride?: number | null;
  saveAddress?: boolean;
  /** Extra writes inside the same transaction (e.g. clearing the cart). */
  inTransaction?: (tx: Prisma.TransactionClient) => Promise<void>;
};

/**
 * The one place an order is created (web checkout and admin manual orders): validates delivery and
 * coupon, then — in one transaction — reserves stock, counts the coupon use, snapshots the order.
 */
export async function createOrder(params: CreateOrderParams) {
  const { lines, locale, customer, userId } = params;
  if (lines.length === 0) throw new ApiError(400, "cartEmpty");
  if (lines.some((i) => !i.available)) throw new ApiError(409, "cartHasUnavailable");

  const zone = await zoneForDistrict(customer.district);
  if (!zone) throw new ApiError(400, "deliveryUnavailable");

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const coupon = await resolveCoupon(params.couponCode, subtotal, customer.phone);
  if (coupon?.problem) throw new ApiError(400, coupon.problem as "couponNotFound");

  const computed = computeTotals({
    subtotal,
    zone: { fee: zone.fee, freeAboveSubtotal: zone.freeAboveSubtotal },
    coupon: coupon?.coupon ? toRule(coupon.coupon) : null,
  });
  const override = params.shippingFeeOverride;
  const totals =
    override === undefined || override === null
      ? computed
      : {
          ...computed,
          shippingFee: override,
          grandTotal: computed.subtotal - computed.discount + override,
        };
  const snapshots = await itemSnapshots(lines);
  const guestAccessToken = newToken();

  const order = await prisma.$transaction(async (tx) => {
    // Reserve stock atomically: a concurrent order can never oversell.
    for (const item of lines) {
      const { count } = await tx.productVariant.updateMany({
        where: { id: item.variantId, isActive: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) throw new ApiError(409, "cartHasUnavailable");
    }
    await syncProductStock(
      tx,
      lines.map((i) => i.productId),
    );

    if (coupon?.coupon) {
      // Conditional increment: two orders can never both take the last use.
      const { usageLimit, id } = coupon.coupon;
      const { count } = await tx.coupon.updateMany({
        where: usageLimit === null ? { id } : { id, usedCount: { lt: usageLimit } },
        data: { usedCount: { increment: 1 } },
      });
      if (count === 0) throw new ApiError(400, "couponUsedUp");
    }

    const created = await tx.order.create({
      data: {
        locale,
        userId,
        source: params.source,
        paymentMethod: params.paymentMethod,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        couponCode: coupon?.coupon?.code,
        shippingZoneCode: zone.code,
        note: customer.note,
        guestAccessToken,
        items: { createMany: { data: snapshots } },
        address: {
          create: {
            name: customer.name,
            phone: customer.phone,
            division: customer.division,
            district: customer.district,
            area: customer.area,
            addressLine: customer.addressLine,
          },
        },
        statusHistory: { create: { status: "PENDING", actorName: params.actorName } },
      },
      select: { id: true, number: true },
    });

    if (coupon?.coupon) {
      await tx.couponRedemption.create({
        data: {
          couponId: coupon.coupon.id,
          orderId: created.id,
          phone: customer.phone,
          amount: totals.discount,
        },
      });
    }

    if (userId && params.saveAddress) {
      const address = {
        name: customer.name,
        phone: customer.phone,
        division: customer.division,
        district: customer.district,
        area: customer.area,
        addressLine: customer.addressLine,
      };
      const existing = await tx.address.findFirst({ where: { userId, ...address } });
      if (!existing) {
        const isFirst = (await tx.address.count({ where: { userId } })) === 0;
        await tx.address.create({ data: { ...address, userId, isDefault: isFirst } });
      }
    }

    await params.inTransaction?.(tx);
    return created;
  });

  // Stock changed → product cards / pages show fresh availability.
  invalidate(TAGS.catalog);

  // Email never blocks or fails an order. Online orders are emailed once paid (payment.service).
  if (params.paymentMethod === "COD") {
    afterResponse("Order email failed", { orderId: order.id }, () =>
      sendOrderPlacedEmails(order.id),
    );
  }

  return { id: order.id, number: order.number, token: guestAccessToken };
}

/** Web checkout: the guest/customer cart becomes an order. */
export async function placeOrder(
  token: string | null,
  locale: Locale,
  input: CheckoutInput,
  userId: string | null = null,
) {
  const cartRow = token
    ? await prisma.cart.findUnique({ where: { token }, select: { id: true, couponCode: true } })
    : null;
  const cart = await getCartView(token, locale);
  if (!cartRow || cart.items.length === 0) throw new ApiError(400, "cartEmpty");

  // Unconfirmed COD orders per phone are capped (Settings) — basic protection against fake orders.
  // Unpaid online attempts are counted on their own, so abandoned payments don't block COD.
  const { maxPendingCodPerPhone } = await getStoreSettings();
  const pending = await prisma.order.count({
    where: {
      customerPhone: input.phone,
      status: "PENDING",
      ...(input.paymentMethod === "COD"
        ? { paymentMethod: "COD" }
        : { paymentMethod: { not: "COD" }, paymentStatus: "UNPAID" }),
    },
  });
  if (pending >= maxPendingCodPerPhone) throw new ApiError(429, "tooManyPendingOrders");

  const order = await createOrder({
    lines: cart.items,
    locale,
    customer: input,
    paymentMethod: input.paymentMethod,
    couponCode: cartRow.couponCode,
    userId,
    source: "WEB",
    saveAddress: input.saveAddress,
    inTransaction: async (tx) => {
      await tx.cartItem.deleteMany({ where: { cartId: cartRow.id } });
      await tx.cart.update({ where: { id: cartRow.id }, data: { couponCode: null } });
    },
  });
  return { id: order.id, number: order.number, token: order.token };
}

/** Recomputes the denormalized `totalStock` of products after stock changes. */
export async function syncProductStock(tx: Prisma.TransactionClient, productIds: string[]) {
  for (const productId of new Set(productIds)) {
    const { _sum } = await tx.productVariant.aggregate({
      where: { productId, isActive: true },
      _sum: { stock: true },
    });
    await tx.product.update({ where: { id: productId }, data: { totalStock: _sum.stock ?? 0 } });
  }
}

/** Both languages are stored so staff and customer emails can use either. */
async function itemSnapshots(lines: CartLine[]) {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: lines.map((l) => l.variantId) } },
    include: {
      image: true,
      attributeValues: {
        include: {
          attributeValue: {
            include: { translations: true, attribute: { select: { sortOrder: true } } },
          },
        },
      },
      product: { include: { translations: true, featuredImage: true } },
    },
  });

  return lines.map((line) => {
    const variant = variants.find((v) => v.id === line.variantId)!;
    const name = (l: Locale) =>
      variant.product.translations.find((t) => t.locale === l)?.name ?? line.name;
    const image = variant.image ?? variant.product.featuredImage;
    return {
      productId: line.productId,
      variantId: line.variantId,
      sku: line.sku,
      nameBn: name("bn"),
      nameEn: name("en"),
      variantLabelBn: variantLabel({ variant }, "bn"),
      variantLabelEn: variantLabel({ variant }, "en"),
      imageUrl: image ? imageUrls(image).thumb : null,
      unitPrice: line.unitPrice,
      compareAt: line.compareAt,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    };
  });
}
