import { z } from "zod";
import { DIVISION_CODES, findDistrict } from "@/lib/geo/bd";
import { bdPhone, optionalBdPhone } from "../checkout/checkout.schema";

// Plain zod — shared by account forms and route handlers.

export const addressInput = z
  .object({
    name: z.string().trim().min(2, "required").max(80),
    phone: bdPhone,
    division: z.enum(DIVISION_CODES as [string, ...string[]], "required"),
    district: z.string().min(1, "required"),
    area: z.string().trim().min(2, "required").max(80),
    addressLine: z.string().trim().min(5, "addressTooShort").max(300),
    isDefault: z.boolean().default(false),
  })
  .refine((v) => findDistrict(v.district)?.division === v.division, {
    path: ["district"],
    message: "required",
  });

export type AddressInput = z.infer<typeof addressInput>;

export const profileInput = z.object({
  name: z.string().trim().min(2, "required").max(80),
  // nullish: the profile form submits its parsed output (null when empty) through this schema again.
  phone: optionalBdPhone.nullish().transform((v) => v || null),
  locale: z.enum(["bn", "en"]),
});

export type ProfileInput = z.infer<typeof profileInput>;

export const registerInput = z.object({
  name: z.string().trim().min(2, "required").max(80),
  email: z.email("invalidEmail").max(120),
  phone: optionalBdPhone.optional(),
  password: z.string().min(8, "passwordTooShort").max(128),
});

export const loginInput = z.object({
  email: z.email("invalidEmail"),
  password: z.string().min(1, "required"),
});
