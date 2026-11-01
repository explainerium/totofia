import "server-only";
import { randomBytes } from "node:crypto";
import type { Locale, PaymentMethod, Prisma } from "@/generated/prisma/client";
import { findDistrict } from "@/lib/geo/bd";
import { siteUrl } from "@/lib/site-url";
import type { SessionUser } from "../../auth/session";
import { prisma } from "../../db/prisma";
import {
  checkValidation,
  UNPAID_ONLINE_ORDER_TTL_MINUTES,
  type GatewayValidation,
} from "../../domain/payment/validate";
import { ApiError } from "../../http/api-error";
import { afterResponse } from "../../lib/after-response";
import { logger } from "../../lib/logger";
import {
  checkAamarpayTransaction,
  createAamarpaySession,
  toValidation as aamarpayValidation,
} from "../../integrations/aamarpay/client";
import { sendPurchaseEvent } from "../../integrations/meta/capi";
import {
  createSession as createSslczSession,
  queryByTranId as sslczQueryByTranId,
  validateTransaction as sslczValidate,
} from "../../integrations/sslcommerz/client";
import { changeOrderStatus } from "../order/order-admin.service";
import { sendOrderPlacedEmails } from "../order/order.mail";
import { ONLINE_METHODS, type OnlineMethod } from "./gateway-settings.schema";

const SYSTEM: SessionUser = {
  id: "system",
  name: "System",
  email: "system@totofia",
  role: "ADMIN",
  phone: null,
  locale: "en",
};

const GATEWAY_NAME: Record<OnlineMethod, string> = {
  SSLCOMMERZ: "SSLCommerz",
  AAMARPAY: "aamarPay",
};

export const isOnlineMethod = (m: PaymentMethod): m is OnlineMethod =>
  (ONLINE_METHODS as readonly string[]).includes(m);

/** Starts (or restarts) online payment for an unpaid order. Returns the gateway page URL. */
export async function startOnlinePayment(orderId: string): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { address: true, items: { select: { nameEn: true, quantity: true } } },
  });
  if (!order || !isOnlineMethod(order.paymentMethod)) throw new ApiError(404, "orderNotFound");
  if (order.paymentStatus === "PAID") throw new ApiError(409, "alreadyPaid");
  if (order.status !== "PENDING") throw new ApiError(409, "paymentClosed");

  const provider = order.paymentMethod;
  const tranId = `TF${order.number}-${randomBytes(4).toString("hex")}`;
  await prisma.payment.create({ data: { orderId, provider, tranId, amount: order.grandTotal } });

  const district = order.address ? (findDistrict(order.address.district)?.name.en ?? "") : "";
  const customer = {
    name: order.customerName,
    email: order.customerEmail,
    phone: order.customerPhone,
    address: order.address ? `${order.address.addressLine}, ${order.address.area}` : "",
    city: district || "Dhaka",
  };
  const productName = order.items.map((i) => i.nameEn).join(", ") || `Order ${order.number}`;

  if (provider === "AAMARPAY") {
    const cb = (path: string) => siteUrl(`/api/payments/aamarpay/${path}`);
    return createAamarpaySession({
      tranId,
      amount: Number(order.grandTotal),
      successUrl: cb("success"),
      failUrl: cb("fail"),
      cancelUrl: cb("cancel"),
      description: productName,
      customer,
    });
  }

  const cb = (path: string) => siteUrl(`/api/payments/sslcommerz/${path}`);
  return createSslczSession({
    tranId,
    amount: Number(order.grandTotal),
    successUrl: cb("success"),
    failUrl: cb("fail"),
    cancelUrl: cb("cancel"),
    ipnUrl: cb("ipn"),
    customer,
    productName,
    itemCount: order.items.reduce((n, i) => n + i.quantity, 0),
  });
}

/** Retry from the order page (guest link token). */
export async function retryOnlinePayment(number: number, token: string) {
  const order = await prisma.order.findUnique({
    where: { number },
    select: { id: true, guestAccessToken: true },
  });
  if (!order || order.guestAccessToken !== token) throw new ApiError(404, "orderNotFound");
  return startOnlinePayment(order.id);
}

export type PaymentOutcome = {
  paid: boolean;
  number: number;
  token: string;
  locale: Locale;
};

type Verified = {
  validation: GatewayValidation & Record<string, unknown>;
  reference?: string;
  bankTranId?: string;
  cardType?: string;
  /** SSLCommerz fraud screening: "1" = risky, hold the order until the customer is verified. */
  riskLevel?: string;
  riskTitle?: string;
};

/** Asks the gateway itself about a transaction. SSLCommerz needs the val_id it posted. */
async function verifyWithGateway(
  provider: OnlineMethod,
  tranId: string,
  valId: string | undefined,
): Promise<Verified | null> {
  if (provider === "AAMARPAY") {
    const t = await checkAamarpayTransaction(tranId);
    return {
      validation: { ...t, ...aamarpayValidation(t) },
      reference: t.pg_txnid,
      bankTranId: t.bank_trxid,
      cardType: t.card_type,
    };
  }
  if (!valId) return null;
  const v = await sslczValidate(valId);
  return {
    validation: v,
    reference: valId,
    bankTranId: v.bank_tran_id,
    cardType: v.card_type,
    riskLevel: v.risk_level,
    riskTitle: v.risk_title,
  };
}

/**
 * Settles an attempt using the gateway's own API (never trusting the posted fields).
 * Idempotent: IPN, callbacks, cron and admin re-checks may all arrive, in any order.
 */
export async function settlePayment(tranId: string, valId?: string) {
  const payment = await prisma.payment.findUnique({
    where: { tranId },
    include: { order: true },
  });
  if (!payment) throw new ApiError(404, "notFound");
  const outcome = (paid: boolean): PaymentOutcome => ({
    paid,
    number: payment.order.number,
    token: payment.order.guestAccessToken,
    locale: payment.order.locale,
  });
  if (payment.status === "PAID") return outcome(true);
  if (!isOnlineMethod(payment.provider)) return outcome(false);

  const verified = await verifyWithGateway(payment.provider, tranId, valId);
  if (!verified) return outcome(false);
  const { validation } = verified;
  const check = checkValidation({ tranId, amount: Number(payment.amount) }, validation);
  const raw = validation as unknown as Prisma.InputJsonValue;

  if (!check.ok) {
    logger.warn({ tranId, reason: check.reason, status: validation.status }, "Payment not valid");
    // A still-pending aamarPay payment is not a failure yet.
    if (check.reason !== "notValid" || payment.provider === "SSLCOMMERZ") {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: "INITIATED" },
        data: { status: "FAILED", failReason: check.reason, raw },
      });
    }
    return outcome(false);
  }

  // Conditional update: only the first settlement writes (IPN vs redirect race).
  const paidAt = new Date();
  const gateway = GATEWAY_NAME[payment.provider];
  const settled = await prisma.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "PAID" } },
      data: {
        status: "PAID",
        valId: verified.reference ?? null,
        bankTranId: verified.bankTranId ?? null,
        cardType: verified.cardType ?? null,
        failReason: null,
        raw,
        paidAt,
      },
    });
    if (count === 0) return null;
    // Not the first payment when another attempt already paid (customer paid twice).
    const first = await tx.order.updateMany({
      where: { id: payment.orderId, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: "PAID", paidAt },
    });
    // Read after the write: the row is locked now, so a cancel that just committed is seen.
    const { status } = await tx.order.findUniqueOrThrow({
      where: { id: payment.orderId },
      select: { status: true },
    });
    const notes = [
      {
        authorName: gateway,
        body: `Paid online ${Number(payment.amount).toFixed(2)} BDT via ${verified.cardType ?? gateway} (tran ${tranId}, bank tran ${verified.bankTranId ?? "—"})`,
      },
      // Cases staff must sort out by hand.
      ...(first.count === 0
        ? [
            {
              authorName: "System",
              body: "This order was already paid — refund one of the payments.",
            },
          ]
        : []),
      ...(status === "CANCELLED"
        ? [
            {
              authorName: "System",
              body: "Payment arrived after the order was cancelled — refund or restore manually.",
            },
          ]
        : []),
      ...(verified.riskLevel === "1"
        ? [
            {
              authorName: gateway,
              body: `Flagged as risky (${verified.riskTitle ?? "risk level 1"}) — verify the customer before shipping.`,
            },
          ]
        : []),
    ];
    for (const note of notes) {
      await tx.orderNote.create({ data: { orderId: payment.orderId, ...note } });
    }
    return { firstPayment: first.count > 0, cancelled: status === "CANCELLED" };
  });

  if (settled?.firstPayment) {
    const { orderId } = payment;
    afterResponse("Purchase event failed", { orderId }, () => sendPurchaseEvent(orderId));
    // Online orders are confirmed by email once paid (COD ones when placed).
    if (!settled.cancelled) {
      afterResponse("Order email failed", { orderId }, () => sendOrderPlacedEmails(orderId));
    }
  }
  return outcome(true);
}

/** Customer failed or cancelled on the gateway page (unless it was already paid). */
export async function markAttempt(tranId: string, status: "FAILED" | "CANCELLED", reason?: string) {
  const payment = await prisma.payment.findUnique({ where: { tranId }, include: { order: true } });
  if (!payment) return null;
  await prisma.payment.updateMany({
    where: { id: payment.id, status: "INITIATED" },
    data: { status, failReason: reason?.slice(0, 200) },
  });
  return {
    number: payment.order.number,
    token: payment.order.guestAccessToken,
    locale: payment.order.locale,
  } as const;
}

/** Cron: cancel (and restock) online orders left unpaid for too long. */
export async function expireUnpaidOnlineOrders() {
  const cutoff = new Date(Date.now() - UNPAID_ONLINE_ORDER_TTL_MINUTES * 60_000);
  const stale = await prisma.order.findMany({
    where: {
      paymentMethod: { in: [...ONLINE_METHODS] },
      paymentStatus: "UNPAID",
      status: "PENDING",
      createdAt: { lt: cutoff },
    },
    select: { id: true, payments: { select: { tranId: true, provider: true } } },
  });

  let cancelled = 0;
  for (const order of stale) {
    // Last chance: the gateway may know about a payment whose callback never reached us.
    const paid = await recheckWithGateway(order.payments);
    if (paid) continue;
    // A payment settling right now wins: the cancel only applies while the order is still unpaid.
    const changed = await changeOrderStatus(
      order.id,
      {
        status: "CANCELLED",
        note: "Online payment not completed in time",
        courierName: undefined,
        trackingCode: undefined,
      },
      SYSTEM,
      { onlyIfUnpaid: true },
    ).catch((err: unknown) => {
      // Moved on meanwhile (e.g. staff confirmed it): leave it alone.
      logger.warn({ err, orderId: order.id }, "Unpaid order not cancelled");
      return false;
    });
    if (changed) cancelled += 1;
  }
  return { checked: stale.length, cancelled };
}

/** Admin "check with gateway" and cron fallback. Returns true if an attempt is now PAID. */
export async function recheckWithGateway(
  attempts: { tranId: string; provider: PaymentMethod }[],
): Promise<boolean> {
  for (const { tranId, provider } of attempts) {
    try {
      if (provider === "AAMARPAY") {
        if ((await settlePayment(tranId)).paid) return true;
        continue;
      }
      if (provider === "SSLCOMMERZ") {
        const found = await sslczQueryByTranId(tranId);
        const valid = found.find((a) => a.status === "VALID" || a.status === "VALIDATED");
        if (valid?.val_id && (await settlePayment(tranId, valid.val_id)).paid) return true;
      }
    } catch (err) {
      logger.warn({ err, tranId }, "Gateway recheck failed");
    }
  }
  return false;
}

/** Admin "check with gateway" for one order's attempts (stuck payment / missed IPN). */
export async function recheckOrderPayments(orderId: string) {
  const attempts = await prisma.payment.findMany({
    where: { orderId },
    select: { tranId: true, provider: true },
  });
  return recheckWithGateway(attempts);
}

/** Payment attempts for the admin order page. */
export async function listPayments(orderId: string) {
  const rows = await prisma.payment.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((p) => ({
    id: p.id,
    provider: p.provider,
    tranId: p.tranId,
    amount: Number(p.amount),
    status: p.status,
    cardType: p.cardType,
    bankTranId: p.bankTranId,
    failReason: p.failReason,
    paidAt: p.paidAt,
    createdAt: p.createdAt,
  }));
}

/** Admin "Test connection": creates a throwaway ৳10 session to prove the credentials work. */
export async function testGatewayConnection(provider: OnlineMethod) {
  const tranId = `TFTEST-${randomBytes(4).toString("hex")}`;
  const customer = {
    name: "Totofia Test",
    email: null,
    phone: "01700000000",
    address: "Test",
    city: "Dhaka",
  };
  const home = siteUrl("/");
  const url =
    provider === "AAMARPAY"
      ? await createAamarpaySession({
          tranId,
          amount: 10,
          successUrl: home,
          failUrl: home,
          cancelUrl: home,
          description: "Connection test",
          customer,
        })
      : await createSslczSession({
          tranId,
          amount: 10,
          successUrl: home,
          failUrl: home,
          cancelUrl: home,
          ipnUrl: home,
          customer,
          productName: "Connection test",
          itemCount: 1,
        });
  return { ok: true, gatewayUrl: url };
}
