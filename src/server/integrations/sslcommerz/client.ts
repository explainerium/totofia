import "server-only";
import { ApiError } from "../../http/api-error";
import { logger } from "../../lib/logger";
import type { GatewayValidation } from "../../domain/payment/validate";
import { getGatewayConfig } from "../../modules/payment/gateway-settings.service";

// SSLCommerz v4 (hosted checkout). One integration covers cards, bKash, Nagad, Rocket and banks.
// Docs: https://developer.sslcommerz.com/doc/v4/

type Config = { storeId: string; storePassword: string; baseUrl: string };

/** Credentials come from Admin → Settings → Payments (sandbox or live). */
async function requireConfig(): Promise<Config> {
  const c = await getGatewayConfig("SSLCOMMERZ");
  if (!c) throw new ApiError(503, "paymentUnavailable");
  // SSLCZ_BASE_URL points development/tests at the local mock gateway (never used in production).
  const override = process.env.NODE_ENV !== "production" ? process.env.SSLCZ_BASE_URL : undefined;
  const baseUrl =
    override?.replace(/\/$/, "") ||
    (c.live ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");
  return { storeId: c.storeId, storePassword: c.secret, baseUrl };
}

export type SessionRequest = {
  tranId: string;
  amount: number;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  customer: { name: string; email?: string | null; phone: string; address: string; city: string };
  productName: string;
  itemCount: number;
};

/** Creates a hosted payment session and returns the gateway page to redirect the customer to. */
export async function createSession(req: SessionRequest): Promise<string> {
  const c = await requireConfig();
  const body = new URLSearchParams({
    store_id: c.storeId,
    store_passwd: c.storePassword,
    total_amount: req.amount.toFixed(2),
    currency: "BDT",
    tran_id: req.tranId,
    success_url: req.successUrl,
    fail_url: req.failUrl,
    cancel_url: req.cancelUrl,
    ipn_url: req.ipnUrl,
    cus_name: req.customer.name,
    // The gateway requires an email; a placeholder is used for customers without one.
    cus_email: req.customer.email || "no-email@totofia.com",
    cus_add1: req.customer.address,
    cus_city: req.customer.city,
    cus_country: "Bangladesh",
    cus_phone: req.customer.phone,
    shipping_method: "Courier",
    ship_name: req.customer.name,
    ship_add1: req.customer.address,
    ship_city: req.customer.city,
    ship_postcode: "1000",
    ship_country: "Bangladesh",
    num_of_item: String(req.itemCount),
    product_name: req.productName.slice(0, 250),
    product_category: "Baby clothing",
    product_profile: "physical-goods",
  });

  const res = await fetch(`${c.baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(20_000),
  }).catch((err) => {
    logger.error({ err }, "SSLCommerz session request failed");
    throw new ApiError(502, "paymentUnavailable");
  });
  const json = (await res.json().catch(() => null)) as {
    status?: string;
    GatewayPageURL?: string;
    failedreason?: string;
  } | null;

  if (json?.status !== "SUCCESS" || !json.GatewayPageURL) {
    logger.error({ status: res.status, reason: json?.failedreason }, "SSLCommerz session rejected");
    throw new ApiError(502, "paymentUnavailable");
  }
  return json.GatewayPageURL;
}

export type ValidationResponse = GatewayValidation & {
  bank_tran_id?: string;
  card_type?: string;
  risk_level?: string;
  risk_title?: string;
  [key: string]: unknown;
};

/** Order Validation API — the only source of truth for "was this paid?". */
export async function validateTransaction(valId: string): Promise<ValidationResponse> {
  const c = await requireConfig();
  const url = new URL(`${c.baseUrl}/validator/api/validationserverAPI.php`);
  url.search = new URLSearchParams({
    val_id: valId,
    store_id: c.storeId,
    store_passwd: c.storePassword,
    format: "json",
    v: "1",
  }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new ApiError(502, "paymentUnavailable");
  return (await res.json()) as ValidationResponse;
}

/** Looks up attempts by our transaction id (admin "check payment" for stuck orders). */
export async function queryByTranId(tranId: string): Promise<ValidationResponse[]> {
  const c = await requireConfig();
  const url = new URL(`${c.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`);
  url.search = new URLSearchParams({
    tran_id: tranId,
    store_id: c.storeId,
    store_passwd: c.storePassword,
    format: "json",
  }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new ApiError(502, "paymentUnavailable");
  const json = (await res.json()) as { element?: ValidationResponse[] };
  return json.element ?? [];
}
