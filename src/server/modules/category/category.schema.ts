import { z } from "zod";
import { bilingual, optionalText, slug, uuid } from "../catalog/shared.schema";

export const categoryTranslation = z.object({
  name: z.string().trim().min(1).max(120),
  description: optionalText(2000),
  metaTitle: optionalText(160),
  metaDescription: optionalText(320),
});

export const categoryInput = z.object({
  /** One URL slug shared by both languages so the language switcher keeps the same path. */
  slug,
  parentId: uuid.nullable().default(null),
  imageId: uuid.nullable().default(null),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  isHidden: z.boolean().default(false),
  translations: bilingual(categoryTranslation),
});

export type CategoryInput = z.infer<typeof categoryInput>;
