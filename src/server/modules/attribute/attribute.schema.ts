import { z } from "zod";
import { bilingual, slug } from "../catalog/shared.schema";

const label = z.string().trim().min(1).max(60);

export const attributeInput = z.object({
  code: slug,
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  name: bilingual(label),
});

export const attributeValueInput = z.object({
  code: slug,
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .default(null),
  label: bilingual(label),
});

export type AttributeInput = z.infer<typeof attributeInput>;
export type AttributeValueInput = z.infer<typeof attributeValueInput>;
