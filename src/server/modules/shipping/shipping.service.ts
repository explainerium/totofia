import "server-only";
import type { Locale, Prisma } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { byLocale, toRows } from "../catalog/translations";
import type { ShippingZoneInput } from "./shipping.schema";

type ZoneRow = Prisma.ShippingZoneGetPayload<{ include: { translations: true } }>;

function toDto(row: ZoneRow) {
  const t = byLocale(row.translations);
  return {
    id: row.id,
    code: row.code,
    name: { bn: t.bn?.name ?? "", en: t.en?.name ?? "" },
    fee: Number(row.fee),
    freeAboveSubtotal: row.freeAboveSubtotal === null ? null : Number(row.freeAboveSubtotal),
    minDays: row.minDays,
    maxDays: row.maxDays,
    districts: row.districts,
    isDefault: row.isDefault,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

export type ShippingZone = ReturnType<typeof toDto>;

/** The active zone that delivers to a district (explicit mapping first, then the default zone). */
export async function zoneForDistrict(district: string): Promise<ShippingZone | null> {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { translations: true },
    orderBy: { sortOrder: "asc" },
  });
  const match =
    zones.find((z) => z.districts.includes(district)) ?? zones.find((z) => z.isDefault) ?? null;
  return match ? toDto(match) : null;
}

/** Public list for the checkout page / delivery info (one language). */
export async function listActiveZones(locale: Locale) {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { translations: { where: { locale } } },
    orderBy: { sortOrder: "asc" },
  });
  return zones.map((z) => ({
    code: z.code,
    name: z.translations[0]?.name ?? z.code,
    fee: Number(z.fee),
    freeAboveSubtotal: z.freeAboveSubtotal === null ? null : Number(z.freeAboveSubtotal),
    minDays: z.minDays,
    maxDays: z.maxDays,
  }));
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function listZones() {
  const rows = await prisma.shippingZone.findMany({
    include: { translations: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toDto);
}

function zoneData(input: ShippingZoneInput) {
  const { name: _name, ...rest } = input;
  void _name;
  return rest;
}

export async function createZone(input: ShippingZoneInput) {
  const row = await prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.shippingZone.updateMany({ data: { isDefault: false } });
    await releaseDistricts(tx, input.districts);
    return tx.shippingZone.create({
      data: {
        ...zoneData(input),
        translations: {
          createMany: {
            data: toRows({ bn: { name: input.name.bn }, en: { name: input.name.en } }),
          },
        },
      },
      include: { translations: true },
    });
  });
  return toDto(row);
}

export async function updateZone(id: string, input: ShippingZoneInput) {
  const found = await prisma.shippingZone.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  const row = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.shippingZone.updateMany({ where: { id: { not: id } }, data: { isDefault: false } });
    }
    await releaseDistricts(tx, input.districts, id);
    await tx.shippingZoneTranslation.deleteMany({ where: { zoneId: id } });
    return tx.shippingZone.update({
      where: { id },
      data: {
        ...zoneData(input),
        translations: {
          createMany: {
            data: toRows({ bn: { name: input.name.bn }, en: { name: input.name.en } }),
          },
        },
      },
      include: { translations: true },
    });
  });
  return toDto(row);
}

export async function deleteZone(id: string) {
  const found = await prisma.shippingZone.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
  await prisma.shippingZone.delete({ where: { id } });
}

/** A district belongs to one zone: moving it here removes it from any other zone. */
async function releaseDistricts(
  tx: Prisma.TransactionClient,
  districts: string[],
  exceptZoneId?: string,
) {
  if (!districts.length) return;
  const others = await tx.shippingZone.findMany({
    where: {
      id: exceptZoneId ? { not: exceptZoneId } : undefined,
      districts: { hasSome: districts },
    },
    select: { id: true, districts: true },
  });
  for (const zone of others) {
    await tx.shippingZone.update({
      where: { id: zone.id },
      data: { districts: zone.districts.filter((d) => !districts.includes(d)) },
    });
  }
}
