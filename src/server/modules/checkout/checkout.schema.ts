import { z } from "zod";
import { normalizeBdPhone } from "@/lib/format/phone";
import { DIVISION_CODES, findDistrict } from "@/lib/geo/bd";

// Plain zod — shared by the checkout form and the route handlers.

export const bdPhone = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const phone = normalizeBdPhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "invalidPhone" });
      return z.NEVER;
    }
    return phone;
  });

/**
 * Optional fields: "" or a valid value. (A `z.union` with `z.literal("")` reports only a generic
 * English "Invalid input", hiding the field's own message.)
 */
export const optionalBdPhone = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) return "";
    const phone = normalizeBdPhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "invalidPhone" });
      return z.NEVER;
    }
    return phone;
  });

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((v) => !v || z.email().safeParse(v).success, "invalidEmail");

export const checkoutInput = z
  .object({
    name: z.string().trim().min(2, "required").max(80),
    phone: bdPhone,
    email: optionalEmail.optional().transform((v) => (v ? v.toLowerCase() : undefined)),
    division: z.enum(DIVISION_CODES as [string, ...string[]], "required"),
    district: z.string().min(1, "required"),
    area: z.string().trim().min(2, "required").max(80),
    addressLine: z.string().trim().min(5, "addressTooShort").max(300),
    note: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((v) => v || undefined),
    /** Cash on delivery or an online gateway enabled in Admin → Settings → Payments. */
    paymentMethod: z.enum(["COD", "SSLCOMMERZ", "AAMARPAY"]),
    /** Signed-in customers: also store the address in their address book. */
    saveAddress: z.boolean().optional(),
  })
  .refine((v) => findDistrict(v.district)?.division === v.division, {
    path: ["district"],
    message: "required",
  });

export type CheckoutInput = z.infer<typeof checkoutInput>;

export const previewInput = z.object({
  district: z.string().max(40).optional(),
  phone: z.string().max(20).optional(),
});

export const trackInput = z.object({
  number: z.coerce.number().int().min(1).max(99_999_999),
  phone: bdPhone,
});

export const guestOrderQuery = z.object({ token: z.string().min(20).max(64) });
export const orderNumberParams = z.object({
  number: z.coerce.number().int().min(1).max(2_147_483_647),
});
