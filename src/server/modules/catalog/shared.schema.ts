import { z } from "zod";
import { slugSchemaPattern } from "../../lib/slugify";

// Plain zod — imported by both route handlers and admin forms (no server-only code here).

export const uuid = z.uuid();
export const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(slugSchemaPattern, "lowercase-with-dashes");
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** `{ bn: T, en: T }` — both languages are required (strict language rule). */
export const bilingual = <T extends z.ZodType>(schema: T) => z.object({ bn: schema, en: schema });

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().trim().max(100).optional(),
});
