import { AGE_RANGE_CODES } from "@/server/domain/catalog/age-ranges";
import type { ProductSort } from "@/server/modules/catalog/catalog.service";

// Pure URL <-> filter mapping for listing pages (/shop, /category/*, /age/*, /search).
// Multi-value filters are comma separated: ?size=0-3m,3-6m&color=sage
// Client-safe: only type imports from the server-only catalog service.

export const LISTING_SORTS = [
  "newest",
  "price-asc",
  "price-desc",
  "name",
] as const satisfies readonly ProductSort[];

export type ListingParams = {
  q?: string;
  age?: string;
  sizes: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: ProductSort;
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (first(v) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,40}$/.test(s))
    .slice(0, 20);
/** Bounded, so "?page=1e21" can't reach the database as an impossible offset. */
const positiveInt = (v: string | string[] | undefined, max = 10_000_000) => {
  const n = Number(first(v));
  return Number.isInteger(n) && n >= 0 && n <= max ? n : undefined;
};

export function parseListingParams(raw: Raw): ListingParams {
  const sort = first(raw.sort);
  const age = first(raw.age);
  const page = positiveInt(raw.page, 10_000);
  const q = first(raw.q)?.trim().slice(0, 100);
  return {
    q: q || undefined,
    age: age && (AGE_RANGE_CODES as string[]).includes(age) ? age : undefined,
    sizes: list(raw.size),
    colors: list(raw.color),
    minPrice: positiveInt(raw.min),
    maxPrice: positiveInt(raw.max),
    inStock: first(raw.stock) === "1",
    sort: (LISTING_SORTS as readonly string[]).includes(sort ?? "")
      ? (sort as ProductSort)
      : "newest",
    page: page && page > 0 ? page : 1,
  };
}

/** Serializes params back to a query string, dropping defaults. `overrides` wins. */
export function listingQuery(
  params: ListingParams,
  overrides: Partial<ListingParams> = {},
): string {
  const p = { ...params, ...overrides };
  const qs = new URLSearchParams();
  if (p.q) qs.set("q", p.q);
  if (p.age) qs.set("age", p.age);
  if (p.sizes.length) qs.set("size", p.sizes.join(","));
  if (p.colors.length) qs.set("color", p.colors.join(","));
  if (p.minPrice !== undefined) qs.set("min", String(p.minPrice));
  if (p.maxPrice !== undefined) qs.set("max", String(p.maxPrice));
  if (p.inStock) qs.set("stock", "1");
  if (p.sort !== "newest") qs.set("sort", p.sort);
  if (p.page > 1) qs.set("page", String(p.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(p: ListingParams, includeAge = true): number {
  return (
    (includeAge && p.age ? 1 : 0) +
    p.sizes.length +
    p.colors.length +
    (p.minPrice !== undefined || p.maxPrice !== undefined ? 1 : 0) +
    (p.inStock ? 1 : 0)
  );
}
