import "server-only";
import type { GatewayValidation } from "../../domain/payment/validate";
import { ApiError } from "../../http/api-error";
import { logger } from "../../lib/logger";
import { getGatewayConfig } from "../../modules/payment/gateway-settings.service";

// aamarPay hosted checkout (JSON API). Covers bKash, Nagad, Rocket, cards and banks.
// Sandbox: https://sandbox.aamarpay.com · Live: https://secure.aamarpay.com

type Config = { storeId: string; signatureKey: string; baseUrl: string };

async function requireConfig(): Promise<Config> {
  const c = await getGatewayConfig("AAMARPAY");
  if (!c) throw new ApiError(503, "paymentUnavailable");
  // AAMARPAY_BASE_URL points development/tests at the local mock (never used in production).
  const override =
    process.env.NODE_ENV !== "production" ? process.env.AAMARPAY_BASE_URL : undefined;
  const baseUrl =
    override?.replace(/\/$/, "") ||
    (c.live ? "https://secure.aamarpay.com" : "https://sandbox.aamarpay.com");
  return { storeId: c.storeId, signatureKey: c.secret, baseUrl };
}

export type AamarpaySessionRequest = {
  tranId: string;
  amount: number;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  description: string;
  customer: { name: string; email?: string | null; phone: string; address: string; city: string };
};

/** Creates a payment and returns the aamarPay page to redirect the customer to. */
export async function createAamarpaySession(req: AamarpaySessionRequest): Promise<string> {
  const c = await requireConfig();
  const res = await fetch(`${c.baseUrl}/jsonpost.php`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      store_id: c.storeId,
      signature_key: c.signatureKey,
      tran_id: req.tranId,
      amount: req.amount.toFixed(2),
      currency: "BDT",
      desc: req.description.slice(0, 250),
      cus_name: req.customer.name,
      // aamarPay requires an email; a placeholder is used for customers without one.
      cus_email: req.customer.email || "no-email@totofia.com",
      cus_phone: req.customer.phone,
      cus_add1: req.customer.address,
      cus_city: req.customer.city,
      cus_country: "Bangladesh",
      success_url: req.successUrl,
      fail_url: req.failUrl,
      cancel_url: req.cancelUrl,
      type: "json",
    }),
    signal: AbortSignal.timeout(20_000),
  }).catch((err) => {
    logger.error({ err }, "aamarPay session request failed");
    throw new ApiError(502, "paymentUnavailable");
  });

  const json = (await res.json().catch(() => null)) as {
    result?: string | boolean;
    payment_url?: string;
  } | null;
  if (!json || String(json.result) !== "true" || !json.payment_url) {
    logger.error({ status: res.status, body: json }, "aamarPay session rejected");
    throw new ApiError(502, "paymentUnavailable");
  }
  return json.payment_url;
}

export type AamarpayTransaction = {
  pay_status?: string;
  mer_txnid?: string;
  pg_txnid?: string;
  bank_trxid?: string;
  amount?: string;
  currency?: string;
  card_type?: string;
  [key: string]: unknown;
};

/** Transaction search API — the source of truth for "was this paid?". */
export async function checkAamarpayTransaction(tranId: string): Promise<AamarpayTransaction> {
  const c = await requireConfig();
  const url = new URL(`${c.baseUrl}/api/v1/trxcheck/request.php`);
  url.search = new URLSearchParams({
    request_id: tranId,
    store_id: c.storeId,
    signature_key: c.signatureKey,
    type: "json",
  }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new ApiError(502, "paymentUnavailable");
  return (await res.json()) as AamarpayTransaction;
}

/** Maps an aamarPay transaction onto the shared validation shape (see checkValidation). */
export function toValidation(t: AamarpayTransaction): GatewayValidation {
  return {
    status: t.pay_status === "Successful" ? "VALID" : String(t.pay_status ?? "UNKNOWN"),
    tran_id: t.mer_txnid,
    val_id: t.pg_txnid,
    amount: t.amount,
    currency: t.currency,
  };
}
