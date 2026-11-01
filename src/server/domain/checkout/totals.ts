export type CouponRule = {
  type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrder: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  perPhoneLimit: number | null;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

export type CouponProblem =
  | "couponInactive"
  | "couponNotStarted"
  | "couponExpired"
  | "couponUsedUp"
  | "couponMinOrder"
  | "couponPhoneLimit";

/** Why a coupon cannot be used right now, or null when it can. */
export function couponProblem(
  coupon: CouponRule,
  ctx: { subtotal: number; now?: Date; phoneUses?: number },
): CouponProblem | null {
  const now = ctx.now ?? new Date();
  if (!coupon.isActive) return "couponInactive";
  if (coupon.startsAt && coupon.startsAt > now) return "couponNotStarted";
  if (coupon.endsAt && coupon.endsAt <= now) return "couponExpired";
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return "couponUsedUp";
  if (coupon.minOrder !== null && ctx.subtotal < coupon.minOrder) return "couponMinOrder";
  if (
    coupon.perPhoneLimit !== null &&
    ctx.phoneUses !== undefined &&
    ctx.phoneUses >= coupon.perPhoneLimit
  ) {
    return "couponPhoneLimit";
  }
  return null;
}

export type ZoneRule = { fee: number; freeAboveSubtotal: number | null };

export type Totals = {
  subtotal: number;
  discount: number;
  shippingFee: number;
  grandTotal: number;
  /** Amount still needed for free delivery in this zone, or null when there is no threshold. */
  freeShippingRemaining: number | null;
};

/** Order money math. Discounts are rounded to whole taka and never exceed the subtotal. */
export function computeTotals(input: {
  subtotal: number;
  zone: ZoneRule | null;
  coupon: Pick<CouponRule, "type" | "value" | "maxDiscount"> | null;
}): Totals {
  const { subtotal, zone, coupon } = input;

  let discount = 0;
  if (coupon?.type === "PERCENT") discount = Math.round((subtotal * coupon.value) / 100);
  if (coupon?.type === "FIXED") discount = Math.round(coupon.value);
  // The cap belongs to percent coupons (the admin form hides it for other types).
  if (coupon?.type === "PERCENT" && coupon.maxDiscount !== null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.max(0, Math.min(discount, subtotal));

  const afterDiscount = subtotal - discount;
  const threshold = zone?.freeAboveSubtotal ?? null;
  const reachedThreshold = threshold !== null && afterDiscount >= threshold;
  const shippingFee =
    !zone || coupon?.type === "FREE_SHIPPING" || reachedThreshold || subtotal === 0 ? 0 : zone.fee;

  return {
    subtotal,
    discount,
    shippingFee,
    grandTotal: afterDiscount + shippingFee,
    freeShippingRemaining: threshold === null ? null : Math.max(0, threshold - afterDiscount),
  };
}
