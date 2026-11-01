import "server-only";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { byLocale, toRows } from "../catalog/translations";
import { imageUrls } from "../media/media.service";
import type { CategoryInput } from "./category.schema";
import { invalidate, TAGS } from "../../lib/cache";

const include = {
  translations: true,
  image: true,
  _count: { select: { products: true, children: true } },
} as const;

type Row = NonNullable<Awaited<ReturnType<typeof findRow>>>;

const findRow = (id: string) => prisma.category.findUnique({ where: { id }, include });

function toDto(row: Row) {
  const t = byLocale(row.translations);
  return {
    id: row.id,
    slug: t.en?.slug ?? t.bn?.slug ?? "",
    parentId: row.parentId,
    imageId: row.imageId,
    image: row.image ? imageUrls(row.image) : null,
    sortOrder: row.sortOrder,
    isHidden: row.isHidden,
    translations: t,
    productCount: row._count.products,
    childCount: row._count.children,
    updatedAt: row.updatedAt,
  };
}

export type AdminCategory = ReturnType<typeof toDto>;

export async function listCategories() {
  const rows = await prisma.category.findMany({
    include,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toDto);
}

export async function getCategory(id: string) {
  const row = await findRow(id);
  if (!row) throw new ApiError(404, "notFound");
  return toDto(row);
}

export async function createCategory(input: CategoryInput) {
  if (input.parentId) await assertExists(input.parentId);
  const row = await prisma.category.create({
    data: {
      parentId: input.parentId,
      imageId: input.imageId,
      sortOrder: input.sortOrder,
      isHidden: input.isHidden,
      translations: { createMany: { data: toRows(input.translations, { slug: input.slug }) } },
    },
    include,
  });
  invalidate(TAGS.catalog);
  return toDto(row);
}

export async function updateCategory(id: string, input: CategoryInput) {
  await assertExists(id);
  if (input.parentId) await assertNoCycle(id, input.parentId);

  const row = await prisma.$transaction(async (tx) => {
    await tx.categoryTranslation.deleteMany({ where: { categoryId: id } });
    return tx.category.update({
      where: { id },
      data: {
        parentId: input.parentId,
        imageId: input.imageId,
        sortOrder: input.sortOrder,
        isHidden: input.isHidden,
        translations: { createMany: { data: toRows(input.translations, { slug: input.slug }) } },
      },
      include,
    });
  });
  invalidate(TAGS.catalog);
  return toDto(row);
}

/** Children move up to the root; product links are removed. */
export async function deleteCategory(id: string) {
  await assertExists(id);
  await prisma.category.delete({ where: { id } });
  invalidate(TAGS.catalog);
}

async function assertExists(id: string) {
  const found = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
}

/** A category cannot become its own ancestor. */
async function assertNoCycle(id: string, parentId: string) {
  let current: string | null = parentId;
  while (current) {
    if (current === id) throw new ApiError(400, "categoryCycle");
    const parent: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    if (!parent) throw new ApiError(404, "notFound");
    current = parent.parentId;
  }
}
