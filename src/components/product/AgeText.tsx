import { useLocale, useTranslations } from "next-intl";
import { ageLabel } from "@/lib/format/age";
import { formatNumber } from "@/lib/format/intl";

/** "০–১২ মাস" / "0–12 months" from a product's age span; nothing when the product has none. */
export function AgeText({ min, max }: { min: number | null; max: number | null }) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const label = ageLabel(min, max);
  if (!label) return null;

  const n = (v: number) => formatNumber(v, locale);
  switch (label.key) {
    case "ageMonths":
    case "ageYears":
      return <>{t(label.key, { min: n(label.min), max: n(label.max) })}</>;
    case "ageFromMonths":
    case "ageFromYears":
      return <>{t(label.key, { min: n(label.min) })}</>;
    case "ageUpToMonths":
      return <>{t(label.key, { max: n(label.max) })}</>;
  }
}
