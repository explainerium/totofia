import { z } from "zod";

export const COUPON_TYPES = ["PERCENT", "FIXED", "FREE_SHIPPING"] as const;

const money = z.coerce.number().min(0).max(10_000_000);

export const couponAdminInput = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "lettersNumbersDashes")
      .transform((v) => v.toUpperCase()),
    type: z.enum(COUPON_TYPES),
    value: money.default(0),
    minOrder: money.nullable().default(null),
    maxDiscount: money.nullable().default(null),
    usageLimit: z.coerce.number().int().min(1).nullable().default(null),
    perPhoneLimit: z.coerce.number().int().min(1).nullable().default(null),
    startsAt: z.coerce.date().nullable().default(null),
    endsAt: z.coerce.date().nullable().default(null),
    isActive: z.boolean().default(true),
  })
  .refine((c) => c.type !== "PERCENT" || (c.value > 0 && c.value <= 100), {
    path: ["value"],
    message: "percentBetween1And100",
  })
  .refine((c) => c.type !== "FIXED" || c.value > 0, {
    path: ["value"],
    message: "amountRequired",
  })
  .refine((c) => !c.startsAt || !c.endsAt || c.startsAt < c.endsAt, {
    path: ["endsAt"],
    message: "endMustBeAfterStart",
  });

export type CouponAdminInput = z.infer<typeof couponAdminInput>;
