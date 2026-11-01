"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import { AGE_RANGES } from "@/server/domain/catalog/age-ranges";
import { listingQuery, type ListingParams } from "./params";

export type FilterOption = { code: string; label: string; colorHex: string | null };

export type FilterPanelProps = {
  params: ListingParams;
  categories: { slug: string; name: string }[];
  activeCategory?: string;
  sizes: FilterOption[];
  colors: FilterOption[];
  /** Hidden on /age/[range], where the age comes from the path. */
  showAge: boolean;
  onNavigate?: () => void;
};

const groupClass = "space-y-2 rounded-xl bg-surface-container-low p-space-sm";
const headingClass = "text-label-lg text-on-surface";

/** Sidebar filters. Every change rewrites the URL (page resets to 1); the server re-renders. */
export function FilterPanel(props: FilterPanelProps) {
  const { params, categories, activeCategory, sizes, colors, showAge, onNavigate } = props;
  const t = useTranslations("Listing");
  const ta = useTranslations("Age");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const urlMin = params.minPrice?.toString() ?? "";
  const urlMax = params.maxPrice?.toString() ?? "";
  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);
  // The URL can change elsewhere (a removed filter chip, "clear all", back button): follow it.
  const [fromUrl, setFromUrl] = useState(`${urlMin}-${urlMax}`);
  if (fromUrl !== `${urlMin}-${urlMax}`) {
    setFromUrl(`${urlMin}-${urlMax}`);
    setMin(urlMin);
    setMax(urlMax);
  }

  const go = (overrides: Partial<ListingParams>) => {
    startTransition(() =>
      router.push(`${pathname}${listingQuery(params, { ...overrides, page: 1 })}`),
    );
    onNavigate?.();
  };
  const toggle = (list: string[], code: string) =>
    list.includes(code) ? list.filter((c) => c !== code) : [...list, code];
  const price = (v: string) => (v.trim() && Number(v) >= 0 ? Math.floor(Number(v)) : undefined);

  return (
    <div className={cn("space-y-space-md", pending && "opacity-70")}>
      <div className={groupClass}>
        <p className={headingClass}>{t("categories")}</p>
        <ul className="space-y-0.5">
          {[{ slug: "", name: t("allCategories") }, ...categories].map((c) => {
            const active = (activeCategory ?? "") === c.slug;
            return (
              <li key={c.slug || "all"}>
                <Link
                  href={`${c.slug ? `/category/${c.slug}` : "/shop"}${listingQuery(params, { page: 1 })}`}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded px-1 py-1 text-body-sm hover:bg-surface-container",
                    active
                      ? "font-semibold text-primary"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {showAge ? (
        <div className={groupClass}>
          <p className={headingClass}>{t("age")}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {AGE_RANGES.map((r) => {
              const active = params.age === r.code;
              return (
                <button
                  key={r.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => go({ age: active ? undefined : r.code })}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-center text-label-sm transition-colors",
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                  )}
                >
                  {ta(`${r.code}Range`)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {sizes.length ? (
        <div className={groupClass}>
          <p className={headingClass}>{t("size")}</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const active = params.sizes.includes(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => go({ sizes: toggle(params.sizes, s.code) })}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-label-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {colors.length ? (
        <div className={groupClass}>
          <p className={headingClass}>{t("color")}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const active = params.colors.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  aria-pressed={active}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => go({ colors: toggle(params.colors, c.code) })}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 transition-all",
                    active ? "border-primary ring-2 ring-primary/30" : "border-outline-variant/60",
                  )}
                  style={{ backgroundColor: c.colorHex ?? undefined }}
                >
                  {active ? <Check className="size-4 text-on-surface" aria-hidden /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <form
        className={groupClass}
        onSubmit={(e) => {
          e.preventDefault();
          go({ minPrice: price(min), maxPrice: price(max) });
        }}
      >
        <p className={headingClass}>{t("price")}</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              [t("minPrice"), min, setMin],
              [t("maxPrice"), max, setMax],
            ] as const
          ).map(([label, value, set]) => (
            <label key={label} className="space-y-1 text-label-sm text-on-surface-variant">
              <span>{label}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={formatNumber(0, locale)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-surface-container px-space-sm py-1.5 text-label-md text-primary hover:bg-surface-container-high"
        >
          {t("applyPrice")}
        </button>
      </form>

      <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-low p-space-sm text-body-sm text-on-surface">
        <Checkbox checked={params.inStock} onCheckedChange={(v) => go({ inStock: v === true })} />
        {t("inStockOnly")}
      </label>
    </div>
  );
}
