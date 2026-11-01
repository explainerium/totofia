import { describe, expect, it } from "vitest";
import { normalizeBdPhone } from "@/lib/format/phone";
import { DISTRICTS, DIVISION_CODES } from "@/lib/geo/bd";
import { computeTotals, couponProblem, type CouponRule } from "@/server/domain/checkout/totals";

const insideDhaka = { fee: 70, freeAboveSubtotal: 2000 };

describe("computeTotals", () => {
  it("adds the zone fee below the free-delivery threshold", () => {
    expect(computeTotals({ subtotal: 1500, zone: insideDhaka, coupon: null })).toEqual({
      subtotal: 1500,
      discount: 0,
      shippingFee: 70,
      grandTotal: 1570,
      freeShippingRemaining: 500,
    });
  });
  it("delivers free once the discounted subtotal reaches the threshold", () => {
    const t = computeTotals({ subtotal: 2000, zone: insideDhaka, coupon: null });
    expect(t.shippingFee).toBe(0);
    expect(t.freeShippingRemaining).toBe(0);
  });
  it("uses the discounted subtotal for the threshold", () => {
    const t = computeTotals({
      subtotal: 2100,
      zone: insideDhaka,
      coupon: { type: "FIXED", value: 200, maxDiscount: null },
    });
    expect(t).toMatchObject({ discount: 200, shippingFee: 70, grandTotal: 1970 });
  });
  it("rounds and caps percent discounts", () => {
    const coupon = { type: "PERCENT" as const, value: 15, maxDiscount: 300 };
    expect(computeTotals({ subtotal: 1333, zone: null, coupon }).discount).toBe(200);
    expect(computeTotals({ subtotal: 5000, zone: null, coupon }).discount).toBe(300);
  });
  it("ignores a leftover cap on fixed coupons", () => {
    const coupon = { type: "FIXED" as const, value: 500, maxDiscount: 100 };
    expect(computeTotals({ subtotal: 2000, zone: null, coupon }).discount).toBe(500);
  });
  it("never discounts more than the subtotal", () => {
    const t = computeTotals({
      subtotal: 300,
      zone: { fee: 130, freeAboveSubtotal: null },
      coupon: { type: "FIXED", value: 500, maxDiscount: null },
    });
    expect(t).toMatchObject({ discount: 300, shippingFee: 130, grandTotal: 130 });
  });
  it("waives delivery for a free-shipping coupon", () => {
    const t = computeTotals({
      subtotal: 800,
      zone: { fee: 130, freeAboveSubtotal: null },
      coupon: { type: "FREE_SHIPPING", value: 0, maxDiscount: null },
    });
    expect(t).toMatchObject({ discount: 0, shippingFee: 0, grandTotal: 800 });
  });
});

describe("couponProblem", () => {
  const now = new Date("2026-10-01T00:00:00Z");
  const base: CouponRule = {
    type: "PERCENT",
    value: 10,
    minOrder: 1000,
    maxDiscount: null,
    usageLimit: 5,
    perPhoneLimit: 1,
    usedCount: 0,
    startsAt: null,
    endsAt: null,
    isActive: true,
  };
  it("accepts a valid coupon", () => {
    expect(couponProblem(base, { subtotal: 1200, now, phoneUses: 0 })).toBeNull();
  });
  it("reports each rule", () => {
    expect(couponProblem({ ...base, isActive: false }, { subtotal: 1200, now })).toBe(
      "couponInactive",
    );
    expect(couponProblem({ ...base, endsAt: now }, { subtotal: 1200, now })).toBe("couponExpired");
    expect(couponProblem({ ...base, usedCount: 5 }, { subtotal: 1200, now })).toBe("couponUsedUp");
    expect(couponProblem(base, { subtotal: 900, now })).toBe("couponMinOrder");
    expect(couponProblem(base, { subtotal: 1200, now, phoneUses: 1 })).toBe("couponPhoneLimit");
  });
});

describe("normalizeBdPhone", () => {
  it.each([
    ["01712345678", "01712345678"],
    ["+880 1712-345678", "01712345678"],
    ["8801712345678", "01712345678"],
    ["০১৭১২৩৪৫৬৭৮", "01712345678"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeBdPhone(input)).toBe(expected);
  });
  it.each(["0171234567", "02123456789", "01212345678", "abc"])("rejects %s", (input) => {
    expect(normalizeBdPhone(input)).toBeNull();
  });
});

describe("bd geo data", () => {
  it("has 64 districts across 8 divisions with unique codes", () => {
    expect(DIVISION_CODES).toHaveLength(8);
    expect(DISTRICTS).toHaveLength(64);
    expect(new Set(DISTRICTS.map((d) => d.code)).size).toBe(64);
  });
});
