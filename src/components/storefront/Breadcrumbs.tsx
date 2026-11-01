import { ChevronRight, House } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/lib/seo/JsonLd";
import { siteUrl } from "@/lib/site-url";

export type Crumb = { label: string; href?: string };

/** Home › … › current page, plus BreadcrumbList structured data. */
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations("Breadcrumb");
  const locale = await getLocale();
  const all: Crumb[] = [{ label: t("home"), href: "/" }, ...items];
  const prefix = locale === "bn" ? "" : `/${locale}`;

  return (
    <nav aria-label={t("label")} className="mb-space-md">
      <ol className="flex flex-wrap items-center gap-space-xs text-label-md text-on-surface-variant">
        {all.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-space-xs">
            {i > 0 ? <ChevronRight className="size-3.5 text-outline-variant" aria-hidden /> : null}
            {c.href && i < all.length - 1 ? (
              <Link
                href={c.href}
                className="flex items-center gap-1 transition-colors hover:text-primary"
              >
                {i === 0 ? <House className="size-4" aria-hidden /> : null}
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-primary">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: siteUrl(`${prefix}${c.href === "/" ? "" : c.href}`) } : {}),
          })),
        }}
      />
    </nav>
  );
}
