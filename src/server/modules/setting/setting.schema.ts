import { z } from "zod";

const text = (max: number) => z.string().trim().max(max).default("");
const url = z
  .union([z.literal(""), z.url().max(300)])
  .default("")
  .transform((v) => v ?? "");

/** Store-wide settings (one JSON row, key "store"). Defaults keep the site working when unset. */
export const storeSettingsInput = z.object({
  phone: text(40),
  email: z.union([z.literal(""), z.email().max(120)]).default(""),
  addressBn: text(300),
  addressEn: text(300),
  facebookUrl: url,
  instagramUrl: url,
  /** WhatsApp number, digits only with country code, e.g. 8801800868634. */
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{0,15}$/, "digitsOnly")
    .default(""),
  /** Max unconfirmed COD orders per phone number (fraud protection). */
  maxPendingCodPerPhone: z.coerce.number().int().min(1).max(20).default(3),
  ga4Id: text(40),
  fbPixelId: text(40),
});

export type StoreSettings = z.infer<typeof storeSettingsInput>;

export const testEmailInput = z.object({ to: z.email() });
