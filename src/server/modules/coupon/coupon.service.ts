import "server-only";
import type { Coupon } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import type { CouponRule } from "../../domain/checkout/totals";
import { ApiError } from "../../http/api-error";
import type { CouponAdminInput } from "./coupon.schema";

const num = (v: { toString(): string } | null) => (v === null ? null : Number(v));

export function toRule(c: Coupon): CouponRule {
  return {
    type: c.type,
    value: Number(c.value),
    minOrder: num(c.minOrder),
    maxDiscount: num(c.maxDiscount),
    usageLimit: c.usageLimit,
    perPhoneLimit: c.perPhoneLimit,
    usedCount: c.usedCount,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    isActive: c.isActive,
  };
}

export async function findCouponByCode(code: string) {
  return prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
}

export async function phoneRedemptions(couponId: string, phone: string) {
  return prisma.couponRedemption.count({ where: { couponId, phone } });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

function toDto(c: Coupon) {
  return { id: c.id, code: c.code, ...toRule(c), createdAt: c.createdAt };
}

export type AdminCoupon = ReturnType<typeof toDto>;

export async function listCoupons() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toDto);
}

export async function getCoupon(id: string) {
  const row = await prisma.coupon.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, "notFound");
  return toDto(row);
}

/** A cap left over from switching a percent coupon to another type is dropped. */
const couponData = (input: CouponAdminInput) => ({
  ...input,
  maxDiscount: input.type === "PERCENT" ? input.maxDiscount : null,
});

export async function createCoupon(input: CouponAdminInput) {
  return toDto(await prisma.coupon.create({ data: couponData(input) }));
}

export async function updateCoupon(id: string, input: CouponAdminInput) {
  await getCoupon(id);
  return toDto(await prisma.coupon.update({ where: { id }, data: couponData(input) }));
}

/** Used coupons are deactivated instead of deleted so order history keeps its reference. */
export async function deleteCoupon(id: string) {
  const coupon = await getCoupon(id);
  if (coupon.usedCount > 0) {
    await prisma.coupon.update({ where: { id }, data: { isActive: false } });
    return { deactivated: true };
  }
  await prisma.coupon.delete({ where: { id } });
  return { deactivated: false };
}
