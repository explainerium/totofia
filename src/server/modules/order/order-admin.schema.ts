import { z } from "zod";
import { checkoutInput } from "../checkout/checkout.schema";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export const statusChangeInput = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || undefined),
  courierName: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => v || undefined),
  trackingCode: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => v || undefined),
});

export type StatusChangeInput = z.infer<typeof statusChangeInput>;

export const orderNoteInput = z.object({ body: z.string().trim().min(1).max(1000) });

export const paymentStatusInput = z.object({
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]),
});

/** Phone orders taken by staff: same customer fields as checkout + explicit items. */
export const manualOrderInput = checkoutInput.safeExtend({
  locale: z.enum(["bn", "en"]).default("bn"),
  items: z
    .array(z.object({ variantId: z.uuid(), quantity: z.coerce.number().int().min(1).max(50) }))
    .min(1)
    .max(50),
  // nullish: the admin form submits its parsed output (null when empty) through this schema again.
  couponCode: z
    .string()
    .trim()
    .max(40)
    .nullish()
    .transform((v) => v || null),
  /** null = use the zone fee. */
  shippingFee: z.coerce.number().min(0).max(100_000).nullable().default(null),
});

export type ManualOrderInput = z.infer<typeof manualOrderInput>;
