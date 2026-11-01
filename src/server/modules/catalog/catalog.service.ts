import "server-only";
import { cache } from "react";
import type { Locale, Prisma } from "@/generated/prisma/client";
import { findAgeRange } from "../../domain/catalog/age-ranges";
import { effectivePrice, lowestPrice } from "../../domain/pricing/effective-price";
import { prisma } from "../../db/prisma";
import { pagination } from "../../http/response";
import { imageUrls, type ImageUrls } from "../media/media.service";
import { cached, TAGS } from "../../lib/cache";

// Storefront reads. Called directly from Server Components (no HTTP hop). Every result is
// already in one language — the caller's locale.

const published = (now = new Date()): Prisma.ProductWhereInput => ({
  status: "PUBLISHED",
  publishedAt: { lte: now },
});

// ─── Categories ──────────────────────────────────────────────────────────────

export type NavCategory = {
  id: string;
  slug: string;
  name: string;
  image: ImageUrls | null;
  children: NavCategory[];
};

/** Visible category tree for header/footer/home, in one language. Cached per request. */
const getCategoryTreeDb = async (locale: Locale): Promise<NavCategory[]> => {
  const rows = await prisma.category.findMany({
    where: { isHidden: false },
    include: { translations: { where: { locale } }, image: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const nodes = new Map<string, NavCategory & { parentId: string | null }>();
  for (const row of rows) {
    const t = row.translations[0];
    if (!t) continue; // strict language rule: untranslated categories are not shown
    nodes.set(row.id, {
      id: row.id,
      slug: t.slug,
      name: t.name,
      image: row.image ? imageUrls(row.image) : null,
      children: [],
      parentId: row.parentId,
    });
  }

  const roots: NavCategory[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    (parent ? parent.children : roots).push(node);
  }
  return roots;
};

const getCategoryBySlugDb = async (locale: Locale, slug: string) => {
  const row = await prisma.category.findFirst({
    where: { isHidden: false, translations: { some: { locale, slug } } },
    include: {
      translations: { where: { locale } },
      children: { where: { isHidden: false }, select: { id: true } },
    },
  });
  const t = row?.translations[0];
  if (!row || !t) return null;
  return {
    id: row.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    childIds: row.children.map((c) => c.id),
  };
};

// ─── Product cards / listing ─────────────────────────────────────────────────

const cardInclude = (locale: Locale) =>
  ({
    translations: { where: { locale }, select: { name: true, slug: true } },
    featuredImage: true,
    variants: {
      where: { isActive: true },
      select: {
        id: true,
        price: true,
        salePrice: true,
        saleStartsAt: true,
        saleEndsAt: true,
        stock: true,
      },
    },
  }) satisfies Prisma.ProductInclude;

type CardRow = Prisma.ProductGetPayload<{ include: ReturnType<typeof cardInclude> }>;

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  image: ImageUrls | null;
  price: number | null;
  compareAt: number | null;
  inStock: boolean;
  badges: ("NEW" | "ORGANIC" | "BESTSELLER")[];
  ageMinMonths: number | null;
  ageMaxMonths: number | null;
  /** More than one active variant → "choose size" instead of quick add. */
  hasOptions: boolean;
  /** The only active variant, when the card can add to the bag directly. */
  quickAddVariantId: string | null;
};

function toCard(row: CardRow): ProductCard | null {
  const t = row.translations[0];
  if (!t) return null;
  const variants = row.variants.map((v) => ({
    price: Number(v.price),
    salePrice: v.salePrice === null ? null : Number(v.salePrice),
    saleStartsAt: v.saleStartsAt,
    saleEndsAt: v.saleEndsAt,
  }));
  const best = lowestPrice(variants);
  return {
    id: row.id,
    slug: t.slug,
    name: t.name,
    image: row.featuredImage ? imageUrls(row.featuredImage) : null,
    price: best?.price ?? null,
    compareAt: best?.compareAt ?? null,
    inStock: row.variants.some((v) => v.stock > 0),
    badges: row.badges,
    ageMinMonths: row.ageMinMonths,
    ageMaxMonths: row.ageMaxMonths,
    hasOptions: row.variants.length > 1,
    quickAddVariantId:
      row.variants.length === 1 && row.variants[0].stock > 0 ? row.variants[0].id : null,
  };
}

export const PRODUCT_SORTS = ["newest", "price-asc", "price-desc", "name"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductFilters = {
  categoryId?: string;
  /** Include products of these child categories too. */
  childCategoryIds?: string[];
  q?: string;
  age?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
  page?: number;
  limit?: number;
};

async function listProductsDb(locale: Locale, filters: ProductFilters) {
  const { skip, take, meta } = pagination({ page: filters.page, limit: filters.limit ?? 12 }, 48);
  const and: Prisma.ProductWhereInput[] = [published(), { translations: { some: { locale } } }];

  if (filters.categoryId) {
    const ids = [filters.categoryId, ...(filters.childCategoryIds ?? [])];
    and.push({ categories: { some: { categoryId: { in: ids } } } });
  }
  if (filters.q) {
    and.push({
      translations: { some: { locale, name: { contains: filters.q, mode: "insensitive" } } },
    });
  }
  const range = filters.age ? findAgeRange(filters.age) : null;
  if (range) {
    if (range.max !== null) {
      and.push({ OR: [{ ageMinMonths: null }, { ageMinMonths: { lt: range.max } }] });
    }
    and.push({ OR: [{ ageMaxMonths: null }, { ageMaxMonths: { gt: range.min } }] });
  }
  for (const [code, values] of [
    ["size", filters.sizes],
    ["color", filters.colors],
  ] as const) {
    if (values?.length) {
      and.push({
        variants: {
          some: {
            isActive: true,
            attributeValues: {
              some: { attributeValue: { code: { in: values }, attribute: { code } } },
            },
          },
        },
      });
    }
  }
  if (filters.minPrice !== undefined) and.push({ minPrice: { gte: filters.minPrice } });
  if (filters.maxPrice !== undefined) and.push({ minPrice: { lte: filters.maxPrice } });
  if (filters.inStock) and.push({ totalStock: { gt: 0 } });

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.sort === "price-asc"
      ? [{ minPrice: "asc" }]
      : filters.sort === "price-desc"
        ? [{ minPrice: "desc" }]
        : [{ publishedAt: "desc" }];

  const where = { AND: and };
  const [rows, total] = await Promise.all(
    filters.sort === "name"
      ? [
          // Name lives on the translation table; sort there and keep the order.
          prisma.productTranslation
            .findMany({
              where: { locale, product: where },
              orderBy: { name: "asc" },
              skip,
              take,
              select: { product: { include: cardInclude(locale) } },
            })
            .then((r) => r.map((x) => x.product)),
          prisma.product.count({ where }),
        ]
      : [
          prisma.product.findMany({ where, orderBy, skip, take, include: cardInclude(locale) }),
          prisma.product.count({ where }),
        ],
  );

  return {
    items: rows.map(toCard).filter((c): c is ProductCard => c !== null),
    meta: meta(total),
  };
}

async function getFeaturedProductsDb(locale: Locale, limit = 8) {
  const rows = await prisma.product.findMany({
    where: { AND: [published(), { isFeatured: true }, { translations: { some: { locale } } }] },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: cardInclude(locale),
  });
  return rows.map(toCard).filter((c): c is ProductCard => c !== null);
}

/** Published products by id, kept in the given order (wishlist). */
export async function listProductCards(locale: Locale, ids: string[]) {
  if (!ids.length) return [];
  const rows = await prisma.product.findMany({
    where: { AND: [published(), { id: { in: ids } }, { translations: { some: { locale } } }] },
    include: cardInclude(locale),
  });
  const cards = rows.map(toCard).filter((c): c is ProductCard => c !== null);
  return ids.flatMap((id) => cards.find((c) => c.id === id) ?? []);
}

/** Size / color values that are actually used by published products, for the filter sidebar. */
const getFilterOptionsDb = async (locale: Locale) => {
  const attributes = await prisma.attribute.findMany({
    where: { code: { in: ["size", "color"] } },
    include: {
      translations: { where: { locale } },
      values: {
        where: {
          variants: { some: { variant: { isActive: true, product: published() } } },
        },
        include: { translations: { where: { locale } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  const pick = (code: string) => {
    const a = attributes.find((x) => x.code === code);
    return {
      name: a?.translations[0]?.name ?? code,
      values:
        a?.values.flatMap((v) =>
          v.translations[0]
            ? [{ code: v.code, label: v.translations[0].label, colorHex: v.colorHex }]
            : [],
        ) ?? [],
    };
  };
  const price = await prisma.product.aggregate({
    where: published(),
    _min: { minPrice: true },
    _max: { minPrice: true },
  });
  return {
    size: pick("size"),
    color: pick("color"),
    price: {
      min: Math.floor(Number(price._min.minPrice ?? 0)),
      max: Math.ceil(Number(price._max.minPrice ?? 0)),
    },
  };
};

// ─── Product detail ──────────────────────────────────────────────────────────

const getProductBySlugDb = async (locale: Locale, slug: string) => {
  const row = await prisma.product.findFirst({
    where: { AND: [published(), { translations: { some: { locale, slug } } }] },
    include: {
      translations: { where: { locale } },
      images: { include: { asset: true }, orderBy: { sortOrder: "asc" } },
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { category: { include: { translations: { where: { locale } } } } },
      },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          image: true,
          attributeValues: {
            include: {
              attributeValue: {
                include: {
                  translations: { where: { locale } },
                  attribute: { include: { translations: { where: { locale } } } },
                },
              },
            },
          },
        },
      },
    },
  });
  const t = row?.translations[0];
  if (!row || !t) return null;

  // Options (Size, Color ...) offered by this product's variants, in attribute order.
  const options = new Map<
    string,
    {
      code: string;
      name: string;
      sortOrder: number;
      values: Map<
        string,
        { id: string; code: string; label: string; colorHex: string | null; sortOrder: number }
      >;
    }
  >();
  for (const v of row.variants) {
    for (const { attributeValue: av } of v.attributeValues) {
      const option = options.get(av.attribute.code) ?? {
        code: av.attribute.code,
        name: av.attribute.translations[0]?.name ?? av.attribute.code,
        sortOrder: av.attribute.sortOrder,
        values: new Map(),
      };
      option.values.set(av.id, {
        id: av.id,
        code: av.code,
        label: av.translations[0]?.label ?? av.code,
        colorHex: av.colorHex,
        sortOrder: av.sortOrder,
      });
      options.set(av.attribute.code, option);
    }
  }

  const primaryCategory = row.categories[0]?.category;
  const categoryT = primaryCategory?.translations[0];

  return {
    id: row.id,
    slug: t.slug,
    name: t.name,
    shortDescription: t.shortDescription,
    description: t.description,
    materialCare: t.materialCare,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    badges: row.badges,
    ageMinMonths: row.ageMinMonths,
    ageMaxMonths: row.ageMaxMonths,
    category: categoryT
      ? { id: primaryCategory.id, slug: categoryT.slug, name: categoryT.name }
      : null,
    images: row.images.map((img) => ({
      ...imageUrls(img.asset),
      alt: (locale === "bn" ? img.altBn : img.altEn) ?? t.name,
    })),
    options: [...options.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o) => ({
        code: o.code,
        name: o.name,
        values: [...o.values.values()].sort((a, b) => a.sortOrder - b.sortOrder),
      })),
    variants: row.variants.map((v) => {
      const p = effectivePrice({
        price: Number(v.price),
        salePrice: v.salePrice === null ? null : Number(v.salePrice),
        saleStartsAt: v.saleStartsAt,
        saleEndsAt: v.saleEndsAt,
      });
      return {
        id: v.id,
        sku: v.sku,
        price: p.price,
        compareAt: p.compareAt,
        stock: v.stock,
        lowStock: v.stock > 0 && v.stock <= v.lowStockThreshold,
        imageId: v.imageId,
        valueIds: v.attributeValues.map((a) => a.attributeValueId),
      };
    }),
  };
};

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlugDb>>>;

async function getRelatedProductsDb(
  locale: Locale,
  productId: string,
  categoryId?: string,
  limit = 4,
) {
  if (!categoryId) return [];
  const rows = await prisma.product.findMany({
    where: {
      AND: [
        published(),
        { id: { not: productId } },
        { categories: { some: { categoryId } } },
        { translations: { some: { locale } } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: cardInclude(locale),
  });
  return rows.map(toCard).filter((c): c is ProductCard => c !== null);
}

// ─── Search suggestions (header autocomplete) ────────────────────────────────

export async function searchSuggestions(locale: Locale, q: string, limit = 6) {
  const rows = await prisma.productTranslation.findMany({
    where: { locale, name: { contains: q, mode: "insensitive" }, product: published() },
    take: limit,
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      product: { select: { featuredImage: true, minPrice: true } },
    },
  });
  return rows.map((r) => ({
    name: r.name,
    slug: r.slug,
    image: r.product.featuredImage ? imageUrls(r.product.featuredImage).thumb : null,
    price: r.product.minPrice === null ? null : Number(r.product.minPrice),
  }));
}

/** Published product slugs for the sitemap. */
export async function listPublishedSlugs() {
  return prisma.productTranslation.findMany({
    where: { product: published() },
    select: { locale: true, slug: true, product: { select: { updatedAt: true } } },
  });
}

/** Visible categories for the sitemap (slugs are shared by both languages). */
export async function listCategorySlugs() {
  return prisma.categoryTranslation.findMany({
    where: { locale: "bn", category: { isHidden: false } },
    select: { slug: true, category: { select: { updatedAt: true } } },
  });
}

// ─── Cached exports (invalidated with the "catalog" tag on every catalog/stock change) ─

export const getCategoryTree = cache(cached(getCategoryTreeDb, "catalog:tree", [TAGS.catalog]));
export const getCategoryBySlug = cache(
  cached(getCategoryBySlugDb, "catalog:category", [TAGS.catalog]),
);
export const listProducts = cached(listProductsDb, "catalog:list", [TAGS.catalog]);
export const getFeaturedProducts = cached(getFeaturedProductsDb, "catalog:featured", [
  TAGS.catalog,
]);
export const getFilterOptions = cache(
  cached(getFilterOptionsDb, "catalog:filters", [TAGS.catalog]),
);
export const getProductBySlug = cache(
  cached(getProductBySlugDb, "catalog:product", [TAGS.catalog]),
);
export const getRelatedProducts = cached(getRelatedProductsDb, "catalog:related", [TAGS.catalog]);
