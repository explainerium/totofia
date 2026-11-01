import { describe, expect, it } from "vitest";
import { checkValidation } from "@/server/domain/payment/validate";

const expected = { tranId: "TF10001-abc", amount: 1585 };
const valid = { status: "VALID", tran_id: "TF10001-abc", amount: "1585.00", currency: "BDT" };

describe("checkValidation", () => {
  it("accepts a VALID or VALIDATED transaction for the right id and amount", () => {
    expect(checkValidation(expected, valid)).toEqual({ ok: true });
    expect(checkValidation(expected, { ...valid, status: "VALIDATED" })).toEqual({ ok: true });
  });
  it("rejects failed or unknown statuses", () => {
    expect(checkValidation(expected, { ...valid, status: "INVALID_TRANSACTION" })).toEqual({
      ok: false,
      reason: "notValid",
    });
  });
  it("rejects another transaction id", () => {
    expect(checkValidation(expected, { ...valid, tran_id: "TF10002-xyz" }).ok).toBe(false);
  });
  it("rejects a different amount (e.g. tampered)", () => {
    expect(checkValidation(expected, { ...valid, amount: "10.00" })).toEqual({
      ok: false,
      reason: "amountMismatch",
    });
  });
  it("rejects a foreign currency and prefers currency_amount when present", () => {
    expect(checkValidation(expected, { ...valid, currency: "USD" }).ok).toBe(false);
    expect(
      checkValidation(expected, {
        ...valid,
        amount: "18.50",
        currency: "USD",
        currency_type: "BDT",
        currency_amount: "1585.00",
      }),
    ).toEqual({ ok: true });
  });
});
