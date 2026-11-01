import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { effectivePrice } from "../../domain/pricing/effective-price";
import { ApiError } from "../../http/api-error";
import { pagination } from "../../http/response";
import { sanitizeRichText } from "../../lib/sanitize";
import { byLocale, toRows } from "../catalog/translations";
import { syncProductStock } from "../checkout/checkout.service";
import { imageUrls } from "../media/media.service";
import type { ProductInput, VariantInput } from "./product.schema";
import { invalidate, TAGS } from "../../lib/cache";

// ─── Admin: list ─────────────────────────────────────────────────────────────

type ListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categoryId?: string;
};

export async function listAdminProducts(query: ListQuery) {
  const { skip, take, meta } = pagination(query);
  const where: Prisma.ProductWhereInput = {
    status: query.status,
    categories: query.categoryId ? { some: { categoryId: query.categoryId } } : undefined,
    OR: query.q
      ? [
          { translations: { some: { name: { contains: query.q, mode: "insensitive" } } } },
          { variants: { some: { sku: { contains: query.q, mode: "insensitive" } } } },
        ]
      : undefined,
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: "desc" },
      include: {
        translations: { select: { locale: true, name: true, slug: true } },
        featuredImage: true,
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const items = rows.map((row) => {
    const t = byLocale(row.translations);
    return {
      id: row.id,
      status: row.status,
      slug: t.en?.slug ?? "",
      name: { bn: t.bn?.name ?? "", en: t.en?.name ?? "" },
      image: row.featuredImage ? imageUrls(row.featuredImage).thumb : null,
      minPrice: row.minPrice === null ? null : Number(row.minPrice),
      totalStock: row.totalStock,
      variantCount: row._count.variants,
      isFeatured: row.isFeatured,
      updatedAt: row.updatedAt,
    };
  });
  return { items, meta: meta(total) };
}

export type AdminProductListItem = Awaited<ReturnType<typeof listAdminProducts>>["items"][number];

// ─── Admin: detail ───────────────────────────────────────────────────────────

const detailInclude = {
  translations: true,
  categories: { select: { categoryId: true } },
  images: { include: { asset: true }, orderBy: { sortOrder: "asc" } },
  variants: {
    include: { attributeValues: { select: { attributeValueId: true } } },
    orderBy: { sortOrder: "asc" },
  },
} as const;

type DetailRow = NonNullable<Awaited<ReturnType<typeof findDetail>>>;

const findDetail = (id: string) =>
  prisma.product.findUnique({ where: { id }, include: detailInclude });

function toAdminDto(row: DetailRow) {
  const t = byLocale(row.translations);
  const translation = (l: "bn" | "en") => {
    const r = t[l];
    return {
      name: r?.name ?? "",
      shortDescription: r?.shortDescription ?? "",
      description: r?.description ?? "",
      materialCare: r?.materialCare ?? "",
      metaTitle: r?.metaTitle ?? "",
      metaDescription: r?.metaDescription ?? "",
    };
  };

  return {
    id: row.id,
    status: row.status,
    slug: t.en?.slug ?? t.bn?.slug ?? "",
    ageMinMonths: row.ageMinMonths,
    ageMaxMonths: row.ageMaxMonths,
    isFeatured: row.isFeatured,
    badges: row.badges,
    categoryIds: row.categories.map((c) => c.categoryId),
    images: row.images.map((img) => ({
      assetId: img.assetId,
      altBn: img.altBn ?? "",
      altEn: img.altEn ?? "",
      url: imageUrls(img.asset).thumb,
    })),
    translations: { bn: translation("bn"), en: translation("en") },
    variants: row.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: Number(v.price),
      salePrice: v.salePrice === null ? null : Number(v.salePrice),
      saleStartsAt: v.saleStartsAt,
      saleEndsAt: v.saleEndsAt,
      stock: v.stock,
      weightGrams: v.weightGrams,
      isActive: v.isActive,
      attributeValueIds: v.attributeValues.map((a) => a.attributeValueId),
    })),
    updatedAt: row.updatedAt,
  };
}

export type AdminProduct = ReturnType<typeof toAdminDto>;

export async function getAdminProduct(id: string) {
  const row = await findDetail(id);
  if (!row) throw new ApiError(404, "notFound");
  return toAdminDto(row);
}

// ─── Admin: write ────────────────────────────────────────────────────────────

export async function createProduct(input: ProductInput) {
  await assertReferences(input);
  const id = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: productData(input, null),
      select: { id: true },
    });
    await writeRelations(tx, product.id, input);
    await syncProductStock(tx, [product.id]);
    return product.id;
  });
  invalidate(TAGS.catalog);
  return getAdminProduct(id);
}

export async function updateProduct(id: string, input: ProductInput) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { publishedAt: true, variants: { select: { id: true } } },
  });
  if (!existing) throw new ApiError(404, "notFound");
  await assertReferences(input);

  const known = new Set(existing.variants.map((v) => v.id));
  if (input.variants.some((v) => v.id && !known.has(v.id))) throw new ApiError(400, "validation");

  const keep = new Set(input.variants.flatMap((v) => (v.id ? [v.id] : [])));
  const removed = [...known].filter((v) => !keep.has(v));
  // Ordered variants are only switched off: cancelling or returning those orders restocks them.
  const ordered = removed.length
    ? await prisma.orderItem.findMany({
        where: { variantId: { in: removed } },
        select: { variantId: true },
        distinct: ["variantId"],
      })
    : [];
  const retired = ordered.flatMap((o) => (o.variantId ? [o.variantId] : []));

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: productData(input, existing.publishedAt) });
    await tx.productTranslation.deleteMany({ where: { productId: id } });
    await tx.productCategory.deleteMany({ where: { productId: id } });
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({
      where: { id: { in: removed.filter((v) => !retired.includes(v)) } },
    });
    await tx.productVariant.updateMany({
      where: { id: { in: retired } },
      data: { isActive: false, isDefault: false, sortOrder: input.variants.length },
    });
    await writeRelations(tx, id, input);
    await syncProductStock(tx, [id]);
  });
  invalidate(TAGS.catalog);
  return getAdminProduct(id);
}

export async function deleteProduct(id: string) {
  const found = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  // Orders keep pointing at the variants (restock on cancel/return), so ordered products are archived.
  if (await prisma.orderItem.count({ where: { productId: id } })) {
    throw new ApiError(409, "productHasOrders");
  }
  await prisma.product.delete({ where: { id } });
  invalidate(TAGS.catalog);
}

function productData(input: ProductInput, publishedAt: Date | null) {
  const active = input.variants.filter((v) => v.isActive);
  const prices = active.map((v) => effectivePrice(toPriceInput(v)).price);
  return {
    status: input.status,
    ageMinMonths: input.ageMinMonths,
    ageMaxMonths: input.ageMaxMonths,
    isFeatured: input.isFeatured,
    badges: input.badges,
    featuredImageId: input.images[0]?.assetId ?? null,
    publishedAt: input.status === "PUBLISHED" ? (publishedAt ?? new Date()) : publishedAt,
    // Denormalized for listing sort/filter. Sale windows are evaluated at save time.
    // (`totalStock` is recomputed from the variants after they are written.)
    minPrice: prices.length ? Math.min(...prices) : null,
  };
}

async function writeRelations(
  tx: Prisma.TransactionClient,
  productId: string,
  input: ProductInput,
) {
  await tx.productTranslation.createMany({
    data: toRows(
      {
        bn: {
          ...input.translations.bn,
          description: sanitizeRichText(input.translations.bn.description),
        },
        en: {
          ...input.translations.en,
          description: sanitizeRichText(input.translations.en.description),
        },
      },
      { productId, slug: input.slug },
    ),
  });
  await tx.productCategory.createMany({
    data: input.categoryIds.map((categoryId, sortOrder) => ({ productId, categoryId, sortOrder })),
  });
  await tx.productImage.createMany({
    data: input.images.map((img, sortOrder) => ({ productId, sortOrder, ...img })),
  });

  for (const [sortOrder, v] of input.variants.entries()) {
    const data = {
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice,
      saleStartsAt: v.saleStartsAt,
      saleEndsAt: v.saleEndsAt,
      weightGrams: v.weightGrams,
      isActive: v.isActive,
      isDefault: sortOrder === 0,
      sortOrder,
    };
    // Without `stockBase` (API callers) the number is absolute.
    const delta = v.stockBase === undefined ? null : v.stock - v.stockBase;
    const variant = v.id
      ? await tx.productVariant.update({
          where: { id: v.id },
          data: delta === null ? { ...data, stock: v.stock } : data,
          select: { id: true },
        })
      : await tx.productVariant.create({
          data: { ...data, stock: v.stock, productId },
          select: { id: true },
        });
    if (v.id && delta) await applyStockChange(tx, v.id, delta);

    await tx.variantAttributeValue.deleteMany({ where: { variantId: variant.id } });
    await tx.variantAttributeValue.createMany({
      data: v.attributeValueIds.map((attributeValueId) => ({
        variantId: variant.id,
        attributeValueId,
      })),
    });
  }
}

/** Adds `delta` to live stock (orders may have changed it since the form loaded), never below 0. */
async function applyStockChange(tx: Prisma.TransactionClient, variantId: string, delta: number) {
  if (delta > 0) {
    await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: delta } },
    });
    return;
  }
  const { count } = await tx.productVariant.updateMany({
    where: { id: variantId, stock: { gte: -delta } },
    data: { stock: { decrement: -delta } },
  });
  if (count === 0) await tx.productVariant.update({ where: { id: variantId }, data: { stock: 0 } });
}

function toPriceInput(v: VariantInput) {
  return {
    price: v.price,
    salePrice: v.salePrice,
    saleStartsAt: v.saleStartsAt,
    saleEndsAt: v.saleEndsAt,
  };
}

/** Referenced categories, images and attribute values must exist (clean 400 instead of FK error). */
async function assertReferences(input: ProductInput) {
  const valueIds = [...new Set(input.variants.flatMap((v) => v.attributeValueIds))];
  const assetIds = [...new Set(input.images.map((i) => i.assetId))];
  const [categories, assets, values] = await Promise.all([
    prisma.category.count({ where: { id: { in: input.categoryIds } } }),
    prisma.asset.count({ where: { id: { in: assetIds } } }),
    prisma.attributeValue.count({ where: { id: { in: valueIds } } }),
  ]);
  if (
    categories !== new Set(input.categoryIds).size ||
    assets !== assetIds.length ||
    values !== valueIds.length
  ) {
    throw new ApiError(400, "invalidReference");
  }
}
