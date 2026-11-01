// Pure variant-matching rules for the product page picker (unit tested).

export type PickerVariant = { id: string; valueIds: string[]; stock: number };
export type PickerOption = { code: string; values: { id: string }[] };
export type Selection = Record<string, string | undefined>;

/** Starts on the first in-stock variant (or the first variant). */
export function initialSelection(options: PickerOption[], variants: PickerVariant[]): Selection {
  const start = variants.find((v) => v.stock > 0) ?? variants[0];
  const selection: Selection = {};
  for (const option of options) {
    selection[option.code] = option.values.find((val) => start?.valueIds.includes(val.id))?.id;
  }
  return selection;
}

/** The variant whose values match every selected option, if all options are chosen. */
export function matchVariant<V extends PickerVariant>(
  options: PickerOption[],
  variants: V[],
  selection: Selection,
): V | null {
  const chosen = options.map((o) => selection[o.code]);
  if (chosen.some((id) => !id)) return null;
  return variants.find((v) => chosen.every((id) => v.valueIds.includes(id!))) ?? null;
}

/**
 * State of a value button given the other selected options: "ok" = buyable, "out" = exists but
 * sold out, "swap" = only exists with other choices (picking it switches them, see
 * `selectValue`), "none" = no variant has this value at all.
 */
export function valueState(
  options: PickerOption[],
  variants: PickerVariant[],
  selection: Selection,
  optionCode: string,
  valueId: string,
): "ok" | "out" | "swap" | "none" {
  const withValue = variants.filter((v) => v.valueIds.includes(valueId));
  if (!withValue.length) return "none";
  const others = options.filter((o) => o.code !== optionCode).map((o) => selection[o.code]);
  const candidates = withValue.filter((v) => others.every((id) => !id || v.valueIds.includes(id)));
  if (!candidates.length) return "swap";
  return candidates.some((v) => v.stock > 0) ? "ok" : "out";
}

/**
 * Selecting a value that doesn't combine with the rest resets the other options to the first
 * variant that has it (in stock first).
 */
export function selectValue(
  options: PickerOption[],
  variants: PickerVariant[],
  selection: Selection,
  optionCode: string,
  valueId: string,
): Selection {
  const next = { ...selection, [optionCode]: valueId };
  if (matchVariant(options, variants, next)) return next;
  const withValue = variants.filter((v) => v.valueIds.includes(valueId));
  const target = withValue.find((v) => v.stock > 0) ?? withValue[0];
  if (!target) return next;
  const reset: Selection = {};
  for (const o of options)
    reset[o.code] = o.values.find((val) => target.valueIds.includes(val.id))?.id;
  return reset;
}
