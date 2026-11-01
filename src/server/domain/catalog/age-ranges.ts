/** "Shop by age" buckets (months). `max: null` = open ended. */
export const AGE_RANGES = [
  { code: "newborn", min: 0, max: 3 },
  { code: "infant", min: 3, max: 12 },
  { code: "toddler", min: 12, max: 36 },
  { code: "preschool", min: 36, max: null },
] as const;

export type AgeRangeCode = (typeof AGE_RANGES)[number]["code"];

export const AGE_RANGE_CODES = AGE_RANGES.map((r) => r.code) as [AgeRangeCode, ...AgeRangeCode[]];

export function findAgeRange(code: string) {
  return AGE_RANGES.find((r) => r.code === code) ?? null;
}

/**
 * A product fits a bucket when its age span overlaps the bucket. Products without an age span
 * fit every bucket.
 */
export function productFitsAgeRange(
  product: { ageMinMonths: number | null; ageMaxMonths: number | null },
  range: { min: number; max: number | null },
): boolean {
  const pMin = product.ageMinMonths ?? 0;
  const pMax = product.ageMaxMonths ?? Number.POSITIVE_INFINITY;
  const rMax = range.max ?? Number.POSITIVE_INFINITY;
  return pMin < rMax && pMax > range.min;
}
