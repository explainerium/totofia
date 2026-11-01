import type { Locale } from "@/generated/prisma/client";

/** `[{ locale: "bn", ... }, { locale: "en", ... }]` → `{ bn: {...}, en: {...} }` (without id/locale/fk). */
export function byLocale<T extends { locale: Locale }>(
  rows: T[],
): Record<Locale, Omit<T, "locale" | "id"> | undefined> {
  const pick = (l: Locale) => {
    const row = rows.find((r) => r.locale === l);
    if (!row) return undefined;
    const rest: Record<string, unknown> = { ...row };
    delete rest.locale;
    delete rest.id;
    return rest as Omit<T, "locale" | "id">;
  };
  return { bn: pick("bn"), en: pick("en") };
}

/** `{ bn, en }` → rows for a nested Prisma `createMany`. */
export function toRows<T extends object, E extends object = object>(
  value: Record<Locale, T>,
  extra?: E,
): (T & E & { locale: Locale })[] {
  return (["bn", "en"] as const).map(
    (locale) => ({ ...value[locale], ...extra, locale }) as T & E & { locale: Locale },
  );
}
