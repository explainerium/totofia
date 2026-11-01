"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePathname, useRouter } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/intl";
import { FilterPanel, type FilterPanelProps } from "./FilterPanel";
import { LISTING_SORTS, listingQuery, type ListingParams } from "./params";

const sortKey = {
  newest: "sortNewest",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
  name: "sortName",
} as const;

export function SortSelect({ params }: { params: ListingParams }) {
  const t = useTranslations("Listing");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-space-xs text-label-md text-on-surface-variant">
      <span className="whitespace-nowrap">{t("sortLabel")}</span>
      <select
        value={params.sort}
        disabled={pending}
        onChange={(e) =>
          startTransition(() =>
            router.push(
              `${pathname}${listingQuery(params, { sort: e.target.value as ListingParams["sort"], page: 1 })}`,
            ),
          )
        }
        className="cursor-pointer rounded-lg bg-surface-container-low py-2 pr-8 pl-3 text-label-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
      >
        {LISTING_SORTS.map((s) => (
          <option key={s} value={s}>
            {t(sortKey[s])}
          </option>
        ))}
      </select>
    </label>
  );
}

/** "Filters" button + bottom-up sheet with the same panel as the desktop sidebar. */
export function MobileFilters({ count, ...panel }: FilterPanelProps & { count: number }) {
  const t = useTranslations("Listing");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center gap-space-xs rounded-lg bg-surface-container-low px-3 py-2 text-label-md text-on-surface lg:hidden">
        <SlidersHorizontal className="size-4" aria-hidden />
        {t("showFilters")}
        {count ? (
          <span className="rounded-full bg-primary px-1.5 text-label-sm text-on-primary">
            {formatNumber(count, locale)}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[85dvh] gap-0 rounded-t-3xl bg-surface p-0"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 p-space-md">
          <SheetTitle className="font-heading text-headline-sm text-on-surface">
            {t("filters")}
          </SheetTitle>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeFilters")}
            className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-space-md">
          <FilterPanel {...panel} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
