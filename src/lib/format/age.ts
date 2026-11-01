/**
 * Picks the message key + values for a product's age span. Spans up to 24 months read in months
 * ("0–12 months"), longer ones in years ("1–3 years"). The caller formats the numbers.
 */
export type AgeLabel =
  | { key: "ageMonths" | "ageYears"; min: number; max: number }
  | { key: "ageFromMonths" | "ageFromYears"; min: number }
  | { key: "ageUpToMonths"; max: number }
  | null;

export function ageLabel(minMonths: number | null, maxMonths: number | null): AgeLabel {
  if (minMonths === null && maxMonths === null) return null;
  if (minMonths === null) return { key: "ageUpToMonths", max: maxMonths! };
  if (maxMonths === null) {
    return minMonths >= 24 && minMonths % 12 === 0
      ? { key: "ageFromYears", min: minMonths / 12 }
      : { key: "ageFromMonths", min: minMonths };
  }
  if (maxMonths > 24 && minMonths % 12 === 0 && maxMonths % 12 === 0) {
    return { key: "ageYears", min: minMonths / 12, max: maxMonths / 12 };
  }
  return { key: "ageMonths", min: minMonths, max: maxMonths };
}
