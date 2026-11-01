const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

/**
 * Normalizes a Bangladeshi mobile number to `01XXXXXXXXX`: accepts Bangla digits, spaces/dashes
 * and a +880 / 880 / 0088 prefix. Returns null when it is not a valid BD mobile number.
 */
export function normalizeBdPhone(input: string): string | null {
  const latin = input.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)));
  let digits = latin.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("880")) digits = digits.slice(2);
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}
