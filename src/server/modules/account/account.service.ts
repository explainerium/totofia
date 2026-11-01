import "server-only";
import type { Address, Locale } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { pagination } from "../../http/response";
import type { AddressInput, ProfileInput } from "./account.schema";

// ─── Addresses ───────────────────────────────────────────────────────────────

const MAX_ADDRESSES = 10;

function toAddress(a: Address) {
  return {
    id: a.id,
    name: a.name,
    phone: a.phone,
    division: a.division,
    district: a.district,
    area: a.area,
    addressLine: a.addressLine,
    isDefault: a.isDefault,
  };
}

export type SavedAddress = ReturnType<typeof toAddress>;

export async function listAddresses(userId: string) {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(toAddress);
}

export async function createAddress(userId: string, input: AddressInput) {
  const count = await prisma.address.count({ where: { userId } });
  if (count >= MAX_ADDRESSES) throw new ApiError(400, "tooManyAddresses", { max: MAX_ADDRESSES });
  // The first address becomes the default.
  const isDefault = input.isDefault || count === 0;
  const row = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...input, isDefault, userId } });
  });
  return toAddress(row);
}

export async function updateAddress(userId: string, id: string, input: AddressInput) {
  await assertOwn(userId, id);
  const row = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return tx.address.update({ where: { id }, data: input });
  });
  return toAddress(row);
}

export async function deleteAddress(userId: string, id: string) {
  const address = await assertOwn(userId, id);
  await prisma.address.delete({ where: { id } });
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
}

async function assertOwn(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new ApiError(404, "notFound");
  return address;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function updateProfile(userId: string, input: ProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name, phone: input.phone, locale: input.locale },
    select: { name: true, email: true, phone: true, locale: true },
  });
  return user;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function listUserOrders(
  userId: string,
  locale: Locale,
  query: { page?: number; limit?: number },
) {
  const { skip, take, meta } = pagination({ page: query.page, limit: query.limit ?? 10 }, 50);
  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        items: { select: { nameBn: true, nameEn: true, imageUrl: true, quantity: true } },
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return {
    items: rows.map((o) => ({
      number: o.number,
      status: o.status,
      createdAt: o.createdAt,
      grandTotal: Number(o.grandTotal),
      itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
      previewNames: o.items.slice(0, 2).map((i) => (locale === "bn" ? i.nameBn : i.nameEn)),
      images: o.items.slice(0, 3).flatMap((i) => (i.imageUrl ? [i.imageUrl] : [])),
      guestAccessToken: o.guestAccessToken,
    })),
    meta: meta(total),
  };
}

export type UserOrderListItem = Awaited<ReturnType<typeof listUserOrders>>["items"][number];
