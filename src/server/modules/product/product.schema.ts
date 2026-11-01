import { z } from "zod";
import { bilingual, listQuery, optionalText, slug, uuid } from "../catalog/shared.schema";

export const PRODUCT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const PRODUCT_BADGES = ["NEW", "ORGANIC", "BESTSELLER"] as const;

export const productTranslation = z.object({
  name: z.string().trim().min(1).max(160),
  shortDescription: optionalText(500),
  /** Rich text (HTML) — sanitized by the service. */
  description: optionalText(20000),
  materialCare: optionalText(2000),
  metaTitle: optionalText(160),
  metaDescription: optionalText(320),
});

const money = z.coerce.number().min(1).max(10_000_000);
const optionalDate = z.coerce.date().nullable().default(null);
const stockCount = z.coerce.number().int().min(0).max(1_000_000);

export const variantInput = z
  .object({
    id: uuid.optional(),
    sku: z.string().trim().min(1).max(64),
    price: money,
    salePrice: money.nullable().default(null),
    saleStartsAt: optionalDate,
    saleEndsAt: optionalDate,
    stock: stockCount,
    /**
     * Stock when the form was loaded. With it, an edit is applied as a change (orders placed
     * meanwhile are kept) and an unchanged field leaves live stock alone.
     */
    stockBase: stockCount.optional(),
    weightGrams: z.coerce.number().int().min(0).max(100_000).nullable().default(null),
    isActive: z.boolean().default(true),
    attributeValueIds: z.array(uuid).max(10).default([]),
  })
  .refine((v) => v.salePrice === null || v.salePrice < v.price, {
    path: ["salePrice"],
    message: "salePriceMustBeLower",
  });

export const productInput = z
  .object({
    status: z.enum(PRODUCT_STATUSES).default("DRAFT"),
    slug,
    ageMinMonths: z.coerce.number().int().min(0).max(240).nullable().default(null),
    ageMaxMonths: z.coerce.number().int().min(1).max(240).nullable().default(null),
    isFeatured: z.boolean().default(false),
    badges: z.array(z.enum(PRODUCT_BADGES)).default([]),
    categoryIds: z.array(uuid).max(20).default([]),
    /** Ordered gallery; the first image is the featured image. */
    images: z
      .array(z.object({ assetId: uuid, altBn: optionalText(160), altEn: optionalText(160) }))
      .max(20)
      .default([]),
    translations: bilingual(productTranslation),
    variants: z.array(variantInput).min(1).max(100),
  })
  .refine(
    (p) => p.ageMinMonths === null || p.ageMaxMonths === null || p.ageMinMonths < p.ageMaxMonths,
    { path: ["ageMaxMonths"], message: "ageMaxMustBeGreater" },
  )
  .refine((p) => new Set(p.variants.map((v) => v.sku.toLowerCase())).size === p.variants.length, {
    path: ["variants"],
    message: "duplicateSku",
  });

export type ProductInput = z.infer<typeof productInput>;
export type VariantInput = z.infer<typeof variantInput>;

export const adminProductListQuery = listQuery.extend({
  status: z.enum(PRODUCT_STATUSES).optional(),
  categoryId: uuid.optional(),
});
