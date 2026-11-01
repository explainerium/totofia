import { PackageSearch, X } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductGrid } from "@/components/product/ProductCard";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/intl";
import {
  getCategoryTree,
  getFilterOptions,
  listProducts,
} from "@/server/modules/catalog/catalog.service";
import { Breadcrumbs, type Crumb } from "../Breadcrumbs";
import { FilterPanel } from "./FilterPanel";
import { MobileFilters, SortSelect } from "./ListingControls";
import { Pagination } from "./Pagination";
import { activeFilterCount, listingQuery, type ListingParams } from "./params";

const PAGE_SIZE = 12;

type Props = {
  title: string;
  description?: string | null;
  breadcrumbs: Crumb[];
  /** Path of this listing without locale ("/shop", "/category/sets" …). */
  basePath: string;
  params: ListingParams;
  category?: { id: string; slug: string; childIds: string[] };
  /** Age bucket fixed by the route (/age/[range]). */
  fixedAge?: string;
};

/** Shared listing page body: intro, toolbar, filter sidebar, grid, pagination. */
export async function ProductListing({
  title,
  description,
  breadcrumbs,
  basePath,
  params,
  category,
  fixedAge,
}: Props) {
  const locale = await getLocale();
  const t = await getTranslations("Listing");
  const age = fixedAge ?? params.age;

  const [result, options, tree] = await Promise.all([
    listProducts(locale, {
      categoryId: category?.id,
      childCategoryIds: category?.childIds,
      q: params.q,
      age,
      sizes: params.sizes,
      colors: params.colors,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStock: params.inStock,
      sort: params.sort,
      page: params.page,
      limit: PAGE_SIZE,
    }),
    getFilterOptions(locale),
    getCategoryTree(locale),
  ]);

  const { total, page, totalPages } = result.meta;
  const from = result.items.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = from ? from + result.items.length - 1 : 0;
  const n = (v: number) => formatNumber(v, locale);
  const filterCount = activeFilterCount(params, !fixedAge);

  const panel = {
    params,
    categories: tree.map((c) => ({ slug: c.slug, name: c.name })),
    activeCategory: category?.slug,
    sizes: options.size.values,
    colors: options.color.values,
    showAge: !fixedAge,
  };

  return (
    <>
      <div className="relative overflow-hidden bg-surface-container-low pb-space-lg">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-secondary-fixed/20 blur-3xl" />
        <div className="relative mx-auto max-w-shop px-margin-sm pt-space-md md:px-gutter">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="text-headline-lg-mobile font-bold tracking-tight text-on-surface md:text-headline-lg">
            {title}
          </h1>
          {description ? (
            <p className="mt-space-xs max-w-2xl text-body-md text-on-surface-variant">
              {description}
            </p>
          ) : null}
          <p className="mt-space-sm inline-block rounded-full bg-surface-container-highest px-2.5 py-0.5 text-label-sm text-on-surface-variant">
            {t("resultCount", { count: total })}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-shop px-margin-sm py-space-lg md:px-gutter">
        <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
          <p className="text-body-sm text-on-surface-variant">
            {from ? t("showing", { from: n(from), to: n(to), total: n(total) }) : null}
          </p>
          <div className="flex items-center gap-space-sm">
            <MobileFilters {...panel} count={filterCount} />
            <SortSelect params={params} />
          </div>
        </div>

        {filterCount ? (
          <div className="mb-space-lg flex flex-wrap items-center gap-space-xs">
            <p className="mr-space-xs text-label-sm text-on-surface-variant">
              {t("selectedCount", { count: filterCount })}
            </p>
            <Link
              href={`${basePath}${listingQuery({ ...params, age: undefined, sizes: [], colors: [], minPrice: undefined, maxPrice: undefined, inStock: false }, { page: 1 })}`}
              className="flex items-center gap-1 text-label-sm text-primary hover:underline"
            >
              <X className="size-3.5" aria-hidden />
              {t("clearAll")}
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          <aside className="hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm lg:sticky lg:top-48 lg:col-span-3 lg:block">
            <p className="mb-space-sm font-heading text-headline-sm font-bold text-on-surface">
              {t("filters")}
            </p>
            <FilterPanel {...panel} />
          </aside>

          <div className="lg:col-span-9">
            {result.items.length ? (
              <>
                <ProductGrid products={result.items} columns={3} />
                <Pagination
                  basePath={basePath}
                  params={params}
                  page={page}
                  totalPages={totalPages}
                />
              </>
            ) : (
              <div className="flex flex-col items-center rounded-2xl bg-surface-container-lowest px-space-lg py-16 text-center">
                <PackageSearch className="mb-space-md size-12 text-outline" aria-hidden />
                <h2 className="text-headline-sm text-on-surface">{t("emptyTitle")}</h2>
                <p className="mt-space-xs max-w-sm text-body-md text-on-surface-variant">
                  {t("emptyBody")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
