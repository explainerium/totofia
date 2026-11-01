import "server-only";
import { prisma } from "../../db/prisma";
import {
  canTransition,
  marksCodPaidOn,
  notifiesCustomerOn,
  releasesCouponOn,
  restocksOn,
} from "../../domain/order/transitions";
import { ApiError } from "../../http/api-error";
import { afterResponse } from "../../lib/after-response";
import type { SessionUser } from "../../auth/session";
import { linesForVariants } from "../cart/cart.service";
import { createOrder, syncProductStock } from "../checkout/checkout.service";
import { sendOrderStatusEmail } from "./order.mail";
import type { ManualOrderInput, StatusChangeInput } from "./order-admin.schema";
import { invalidate, TAGS } from "../../lib/cache";

/**
 * Moves an order along its lifecycle. Cancelling/returning puts items back in stock, cancelling
 * frees the coupon use, delivery marks COD as paid. The customer is emailed for key steps.
 * `onlyIfUnpaid` (cron): skip, returning false, if the order got paid in the meantime.
 */
export async function changeOrderStatus(
  id: string,
  input: StatusChangeInput,
  actor: SessionUser,
  { onlyIfUnpaid = false } = {},
): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, couponRedemption: true },
  });
  if (!order) throw new ApiError(404, "notFound");
  const invalid = () =>
    new ApiError(409, "invalidStatusChange", { from: order.status, to: input.status });
  if (!canTransition(order.status, input.status)) throw invalid();

  const changed = await prisma.$transaction(async (tx) => {
    // Claim the transition first. A concurrent change (double click, two staff, cron vs payment)
    // finds the status already moved on, so stock and coupon uses are given back only once.
    const { count } = await tx.order.updateMany({
      where: { id, status: order.status, ...(onlyIfUnpaid ? { paymentStatus: "UNPAID" } : {}) },
      data: {
        status: input.status,
        courierName: input.courierName ?? undefined,
        trackingCode: input.trackingCode ?? undefined,
        deliveredAt: input.status === "DELIVERED" ? new Date() : undefined,
        paymentStatus:
          marksCodPaidOn(input.status) && order.paymentMethod === "COD" ? "PAID" : undefined,
      },
    });
    if (count === 0) return false;

    if (restocksOn(input.status)) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await syncProductStock(
        tx,
        order.items.flatMap((i) => (i.productId ? [i.productId] : [])),
      );
    }

    if (releasesCouponOn(input.status) && order.couponRedemption) {
      await tx.coupon.update({
        where: { id: order.couponRedemption.couponId },
        data: { usedCount: { decrement: 1 } },
      });
      await tx.couponRedemption.delete({ where: { id: order.couponRedemption.id } });
    }

    await tx.orderStatusHistory.create({
      data: { orderId: id, status: input.status, note: input.note, actorName: actor.name },
    });
    return true;
  });
  if (!changed) {
    if (onlyIfUnpaid) return false;
    throw invalid();
  }

  if (restocksOn(input.status)) invalidate(TAGS.catalog);

  if (notifiesCustomerOn(input.status)) {
    afterResponse("Status email failed", { orderId: id }, () => sendOrderStatusEmail(id));
  }
  return true;
}

export async function addOrderNote(id: string, body: string, actor: SessionUser) {
  const found = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.orderNote.create({ data: { orderId: id, body, authorName: actor.name } });
}

export async function setPaymentStatus(
  id: string,
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED",
  actor: SessionUser,
) {
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) throw new ApiError(404, "notFound");
  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { paymentStatus } }),
    prisma.orderNote.create({
      data: { orderId: id, body: `Payment marked ${paymentStatus}`, authorName: actor.name },
    }),
  ]);
}

/** Phone/walk-in order entered by staff. Uses the same rules as the web checkout. */
export async function createManualOrder(input: ManualOrderInput, actor: SessionUser) {
  const lines = await linesForVariants(input.locale, input.items);
  if (lines.length !== input.items.length) throw new ApiError(400, "invalidReference");

  // Only a verified email proves the account is this customer's: phone numbers on accounts are
  // unverified (anyone could add someone else's) and would expose this order to that account.
  const customer = input.email
    ? await prisma.user.findFirst({
        where: { email: input.email, emailVerified: true },
        select: { id: true },
      })
    : null;

  const order = await createOrder({
    lines,
    locale: input.locale,
    customer: input,
    paymentMethod: "COD",
    couponCode: input.couponCode,
    userId: customer?.id ?? null,
    source: "ADMIN",
    actorName: actor.name,
    shippingFeeOverride: input.shippingFee,
  });
  return { id: order.id, number: order.number };
}
