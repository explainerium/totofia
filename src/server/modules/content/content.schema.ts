import { z } from "zod";
import { bdPhone } from "../checkout/checkout.schema";
import { bilingual, optionalText, slug } from "../catalog/shared.schema";

/**
 * Storefront routes a page slug may not take (the route would hide the page). Pages live at
 * `/<slug>`: about, faq, … have their own routes, any other slug is served by `[...rest]`.
 */
export const RESERVED_PAGE_SLUGS = [
  "account",
  "admin",
  "age",
  "api",
  "bn",
  "cart",
  "category",
  "checkout",
  "contact",
  "en",
  "forgot-password",
  "login",
  "media",
  "order",
  "product",
  "register",
  "reset-password",
  "search",
  "shop",
  "track-order",
  "wishlist",
];

export const pageInput = z.object({
  slug: slug.refine((s) => !RESERVED_PAGE_SLUGS.includes(s), "used-by-a-shop-page"),
  isPublished: z.boolean().default(true),
  translations: bilingual(
    z.object({
      title: z.string().trim().min(1).max(160),
      body: z.string().trim().min(1).max(100_000),
      metaTitle: optionalText(160),
      metaDescription: optionalText(320),
    }),
  ),
});
export type PageInput = z.infer<typeof pageInput>;

const storefrontPath = z
  .string()
  .trim()
  .max(200)
  .regex(/^\/[\w\-/?=&.%]*$/, "startWithSlash")
  .nullable()
  .default(null);

export const bannerInput = z.object({
  placement: z.enum(["HOME_HERO", "HOME_PROMO"]),
  imageId: z.uuid().nullable().default(null),
  titleBn: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  subtitleBn: optionalText(300),
  subtitleEn: optionalText(300),
  ctaLabelBn: optionalText(40),
  ctaLabelEn: optionalText(40),
  link: storefrontPath,
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  startsAt: z.coerce.date().nullable().default(null),
  endsAt: z.coerce.date().nullable().default(null),
  isActive: z.boolean().default(true),
});
export type BannerInput = z.infer<typeof bannerInput>;

export const contactInput = z
  .object({
    name: z.string().trim().min(2, "required").max(80),
    email: z
      .union([z.literal(""), z.email("invalidEmail").max(120)])
      .optional()
      .transform((v) => v || undefined),
    phone: z
      .union([z.literal(""), bdPhone])
      .optional()
      .transform((v) => v || undefined),
    subject: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((v) => v || undefined),
    message: z.string().trim().min(10, "messageTooShort").max(3000),
    /** Honeypot — real people leave it empty. */
    website: z.string().max(0).optional(),
  })
  .refine((v) => v.email || v.phone, { path: ["phone"], message: "emailOrPhone" });

export const newsletterInput = z.object({ email: z.email("invalidEmail").max(120) });

export const contactStatusInput = z.object({ status: z.enum(["NEW", "READ", "ARCHIVED"]) });

export const reviewInput = z.object({
  productId: z.uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, "reviewTooShort").max(2000),
});

export const reviewStatusInput = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]) });
