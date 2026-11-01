import type { Locale } from "@/i18n/routing";

// bn-BD renders Bangla digits with lakh grouping (১,২৩,৪৫৬); en-BD renders 123,456.
const numberLocale: Record<Locale, string> = { bn: "bn-BD", en: "en-BD" };
// en-BD writes dates month-first; Bangladesh reads day-first ("30 September 2026"), as en-GB does.
const dateLocale: Record<Locale, string> = { bn: "bn-BD", en: "en-GB" };
// Dates are the shop's calendar day, not the server's (Vercel runs in UTC, 6 hours behind).
const TIME_ZONE = "Asia/Dhaka";

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(numberLocale[locale], { maximumFractionDigits: 2 }).format(value);
}

/** `৳১,৪৫০` in Bangla, `৳1,450` in English. */
export function formatPrice(amount: number | string, locale: Locale): string {
  return `৳${formatNumber(Number(amount), locale)}`;
}

export function formatDate(
  date: Date | string,
  locale: Locale,
  style: Intl.DateTimeFormatOptions["dateStyle"] = "long",
): string {
  return new Intl.DateTimeFormat(dateLocale[locale], {
    dateStyle: style,
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}

/** Digits only, no grouping — years, order numbers, OTPs (`২০২৬` / `2026`). */
export function formatDigits(value: number | string, locale: Locale): string {
  return new Intl.NumberFormat(numberLocale[locale], { useGrouping: false }).format(Number(value));
}

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Replaces Latin digits inside free text (phone numbers, sizes): "+880 1800" → "+৮৮০ ১৮০০" in bn. */
export function localizeDigits(text: string, locale: Locale): string {
  if (locale !== "bn") return text;
  return text.replace(/[0-9]/g, (d) => BANGLA_DIGITS[Number(d)]);
}

/** Whole-number percentage discount between a regular and a sale price (1650 → 1450 = 12). */
export function discountPercent(price: number, compareAt: number): number {
  if (compareAt <= 0 || price >= compareAt) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
