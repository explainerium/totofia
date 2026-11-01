import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import { listingQuery, type ListingParams } from "./params";

/** Page numbers around the current page, with gaps: 1 … 4 5 6 … 12 */
function pageWindow(page: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (const [i, p] of sorted.entries()) {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  }
  return out;
}

type Props = { basePath: string; params: ListingParams; page: number; totalPages: number };

export async function Pagination({ basePath, params, page, totalPages }: Props) {
  if (totalPages <= 1) return null;
  const t = await getTranslations("Listing");
  const locale = await getLocale();
  const href = (p: number) => `${basePath}${listingQuery(params, { page: p })}`;
  const arrow =
    "flex size-10 items-center justify-center rounded-full border border-outline-variant";

  return (
    <nav
      aria-label={t("pagination")}
      className="mt-space-xl flex items-center justify-center gap-space-xs"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          aria-label={t("previous")}
          className={cn(arrow, "hover:bg-surface-container-low")}
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : null}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-outline">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-label={t("page", { page: formatNumber(p, locale) })}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-label-md",
              p === page
                ? "bg-primary text-on-primary"
                : "text-on-surface hover:bg-surface-container-low",
            )}
          >
            {formatNumber(p, locale)}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          aria-label={t("next")}
          className={cn(arrow, "hover:bg-surface-container-low")}
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
