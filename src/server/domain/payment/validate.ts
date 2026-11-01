/** What the gateway's validation API says about a transaction (relevant fields only). */
export type GatewayValidation = {
  status: string;
  tran_id?: string;
  val_id?: string;
  amount?: string | number;
  currency?: string;
  currency_type?: string;
  currency_amount?: string | number;
};

export type PaymentCheck =
  | { ok: true }
  | { ok: false; reason: "notValid" | "tranIdMismatch" | "amountMismatch" | "currencyMismatch" };

/**
 * A payment only counts when the gateway itself (validation API, never the browser POST) says the
 * transaction is VALID/VALIDATED for exactly our transaction id and amount in BDT.
 */
export function checkValidation(
  expected: { tranId: string; amount: number },
  v: GatewayValidation,
): PaymentCheck {
  if (v.status !== "VALID" && v.status !== "VALIDATED") return { ok: false, reason: "notValid" };
  if (v.tran_id !== expected.tranId) return { ok: false, reason: "tranIdMismatch" };

  const currency = v.currency_type ?? v.currency;
  if (currency && currency !== "BDT") return { ok: false, reason: "currencyMismatch" };

  const paid = Number(v.currency_amount ?? v.amount);
  if (!Number.isFinite(paid) || Math.abs(paid - expected.amount) > 0.009) {
    return { ok: false, reason: "amountMismatch" };
  }
  return { ok: true };
}

/** Unpaid online orders are cancelled (and restocked) after this many minutes. */
export const UNPAID_ONLINE_ORDER_TTL_MINUTES = 60;
