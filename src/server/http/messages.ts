import { createTranslator } from "use-intl/core";
import { routing, type Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format/intl";
import bn from "../../../messages/bn.json";
import en from "../../../messages/en.json";

export type ErrorKey = keyof typeof bn.Errors;

const catalogs = { bn, en } as const;

/** Response language: `x-locale` header (set by the API client), then Accept-Language, then bn. */
export function resolveLocale(headers: Headers): Locale {
  const explicit = headers.get("x-locale");
  if (explicit && (routing.locales as readonly string[]).includes(explicit)) {
    return explicit as Locale;
  }
  const accept = headers.get("accept-language") ?? "";
  return /^en\b/i.test(accept) ? "en" : routing.defaultLocale;
}

export function translateError(
  locale: Locale,
  key: ErrorKey,
  vars?: Record<string, string | number>,
): string {
  const t = createTranslator({ locale, messages: catalogs[locale], namespace: "Errors" });
  // Numbers inside messages follow the page language (Bangla digits in bn).
  const localized = vars
    ? Object.fromEntries(
        Object.entries(vars).map(([k, v]) => [
          k,
          typeof v === "number" ? formatNumber(v, locale) : v,
        ]),
      )
    : undefined;
  return t(key, localized);
}
