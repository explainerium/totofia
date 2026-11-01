import "server-only";
import { cache } from "react";
import type { Locale, Prisma } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { sanitizeRichText } from "../../lib/sanitize";
import { byLocale, toRows } from "../catalog/translations";
import type { PageInput } from "./content.schema";
import { cached, invalidate, TAGS } from "../../lib/cache";

type Row = Prisma.PageGetPayload<{ include: { translations: true } }>;

function toDto(row: Row) {
  const t = byLocale(row.translations);
  const tr = (l: Locale) => ({
    title: t[l]?.title ?? "",
    body: t[l]?.body ?? "",
    metaTitle: t[l]?.metaTitle ?? "",
    metaDescription: t[l]?.metaDescription ?? "",
  });
  return {
    id: row.id,
    slug: row.slug,
    isPublished: row.isPublished,
    translations: { bn: tr("bn"), en: tr("en") },
    updatedAt: row.updatedAt,
  };
}

export type AdminPage = ReturnType<typeof toDto>;

export async function listPages() {
  const rows = await prisma.page.findMany({
    include: { translations: true },
    orderBy: { slug: "asc" },
  });
  return rows.map(toDto);
}

export async function getPage(id: string) {
  const row = await prisma.page.findUnique({ where: { id }, include: { translations: true } });
  if (!row) throw new ApiError(404, "notFound");
  return toDto(row);
}

function rows(input: PageInput) {
  const clean = (l: Locale) => ({
    ...input.translations[l],
    body: sanitizeRichText(input.translations[l].body) ?? "",
  });
  return toRows({ bn: clean("bn"), en: clean("en") });
}

export async function createPage(input: PageInput) {
  const row = await prisma.page.create({
    data: {
      slug: input.slug,
      isPublished: input.isPublished,
      translations: { createMany: { data: rows(input) } },
    },
    include: { translations: true },
  });
  invalidate(TAGS.content);
  return toDto(row);
}

export async function updatePage(id: string, input: PageInput) {
  await getPage(id);
  const row = await prisma.$transaction(async (tx) => {
    await tx.pageTranslation.deleteMany({ where: { pageId: id } });
    return tx.page.update({
      where: { id },
      data: {
        slug: input.slug,
        isPublished: input.isPublished,
        translations: { createMany: { data: rows(input) } },
      },
      include: { translations: true },
    });
  });
  invalidate(TAGS.content);
  return toDto(row);
}

export async function deletePage(id: string) {
  await getPage(id);
  await prisma.page.delete({ where: { id } });
  invalidate(TAGS.content);
}

/** Published page in one language, or null (→ 404). */
const getPublishedPageDb = async (locale: Locale, slug: string) => {
  const row = await prisma.page.findFirst({
    where: { slug, isPublished: true },
    include: { translations: { where: { locale } } },
  });
  const t = row?.translations[0];
  if (!row || !t) return null;
  return {
    slug: row.slug,
    title: t.title,
    body: t.body,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    updatedAt: row.updatedAt,
  };
};

export const getPublishedPage = cache(cached(getPublishedPageDb, "content:page", [TAGS.content]));

/** Published pages (sitemap; the catch-all route checks slugs here before rendering one). */
const listPublishedPagesDb = () =>
  prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
    orderBy: { slug: "asc" },
  });

export const listPublishedPages = cache(
  cached(listPublishedPagesDb, "content:pages", [TAGS.content]),
);
