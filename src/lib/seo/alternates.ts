import type { Locale } from "@/i18n/routing";

/**
 * Canonical + hreflang for a storefront path (without locale prefix, e.g. "/shop").
 * Bangla lives at the bare path, English under /en.
 */
export function localeAlternates(path: string, locale: Locale) {
  const clean = path === "/" ? "" : path;
  const bn = clean || "/";
  const en = `/en${clean}`;
  return { canonical: locale === "bn" ? bn : en, languages: { bn, en, "x-default": bn } };
}
