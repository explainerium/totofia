import { z } from "zod";
import { DISTRICT_CODES } from "@/lib/geo/bd";
import { bilingual, slug } from "../catalog/shared.schema";

export const shippingZoneInput = z
  .object({
    code: slug,
    name: bilingual(z.string().trim().min(1).max(80)),
    fee: z.coerce.number().min(0).max(100_000),
    freeAboveSubtotal: z.coerce.number().min(0).max(10_000_000).nullable().default(null),
    minDays: z.coerce.number().int().min(0).max(60).default(1),
    maxDays: z.coerce.number().int().min(0).max(60).default(3),
    districts: z
      .array(z.string().refine((d) => DISTRICT_CODES.includes(d), "unknownDistrict"))
      .default([]),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  })
  .refine((z) => z.minDays <= z.maxDays, { path: ["maxDays"], message: "maxDaysBeforeMin" });

export type ShippingZoneInput = z.infer<typeof shippingZoneInput>;
