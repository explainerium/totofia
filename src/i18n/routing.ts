import { defineRouting } from "next-intl/routing";

export const locales = ["bn", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "bn",
  // Bangla lives at `/`, English at `/en`.
  localePrefix: "as-needed",
  // Bangla is always the default; never redirect based on the browser language.
  localeDetection: false,
});
