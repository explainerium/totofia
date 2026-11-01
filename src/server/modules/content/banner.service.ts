import "server-only";
import type { Banner, Asset, Locale } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { imageUrls } from "../media/media.service";
import type { BannerInput } from "./content.schema";
import { cached, invalidate, TAGS } from "../../lib/cache";

function toDto(row: Banner & { image: Asset | null }) {
  const { image, ...rest } = row;
  return { ...rest, image: image ? imageUrls(image) : null };
}

export type AdminBanner = ReturnType<typeof toDto>;

export async function listBanners() {
  const rows = await prisma.banner.findMany({
    include: { image: true },
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
  });
  return rows.map(toDto);
}

export async function createBanner(input: BannerInput) {
  invalidate(TAGS.content);
  return toDto(await prisma.banner.create({ data: input, include: { image: true } }));
}

export async function updateBanner(id: string, input: BannerInput) {
  invalidate(TAGS.content);
  const found = await prisma.banner.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  // Empty optional texts arrive as undefined; store null so they can be cleared.
  const data = {
    ...input,
    subtitleBn: input.subtitleBn ?? null,
    subtitleEn: input.subtitleEn ?? null,
    ctaLabelBn: input.ctaLabelBn ?? null,
    ctaLabelEn: input.ctaLabelEn ?? null,
  };
  return toDto(await prisma.banner.update({ where: { id }, data, include: { image: true } }));
}

export async function deleteBanner(id: string) {
  const found = await prisma.banner.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.banner.delete({ where: { id } });
  invalidate(TAGS.content);
}

/** Banners currently live for a placement, in one language. */
async function getActiveBannersDb(placement: Banner["placement"], locale: Locale) {
  const now = new Date();
  const rows = await prisma.banner.findMany({
    where: {
      placement,
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
    include: { image: true },
    orderBy: { sortOrder: "asc" },
  });
  const bn = locale === "bn";
  return rows.map((b) => ({
    id: b.id,
    title: bn ? b.titleBn : b.titleEn,
    subtitle: (bn ? b.subtitleBn : b.subtitleEn) ?? null,
    ctaLabel: (bn ? b.ctaLabelBn : b.ctaLabelEn) ?? null,
    link: b.link,
    image: b.image ? imageUrls(b.image) : null,
  }));
}

export type LiveBanner = Awaited<ReturnType<typeof getActiveBannersDb>>[number];

export const getActiveBanners = cached(getActiveBannersDb, "content:banners", [TAGS.content], 60);
