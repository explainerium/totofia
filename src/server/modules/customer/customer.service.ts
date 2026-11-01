import "server-only";
import type { Prisma, UserRole } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { pagination } from "../../http/response";

const COUNTED: Prisma.OrderWhereInput = { status: { notIn: ["CANCELLED", "RETURNED"] } };

export async function listCustomers(query: {
  page?: number;
  limit?: number;
  q?: string;
  role?: UserRole;
}) {
  const { skip, take, meta } = pagination(query);
  const where: Prisma.UserWhereInput = {
    role: query.role,
    OR: query.q
      ? [
          { name: { contains: query.q, mode: "insensitive" } },
          { email: { contains: query.q, mode: "insensitive" } },
          { phone: { contains: query.q } },
        ]
      : undefined,
  };
  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const spent = await prisma.order.groupBy({
    by: ["userId"],
    where: { ...COUNTED, userId: { in: rows.map((r) => r.id) } },
    _sum: { grandTotal: true },
    _max: { createdAt: true },
  });

  return {
    items: rows.map((u) => {
      const s = spent.find((x) => x.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        banned: u.banned,
        createdAt: u.createdAt,
        orderCount: u._count.orders,
        totalSpent: Number(s?._sum.grandTotal ?? 0),
        lastOrderAt: s?._max.createdAt ?? null,
      };
    }),
    meta: meta(total),
  };
}

export type AdminCustomerListItem = Awaited<ReturnType<typeof listCustomers>>["items"][number];

export async function getCustomer(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          number: true,
          status: true,
          grandTotal: true,
          createdAt: true,
        },
      },
    },
  });
  if (!user) throw new ApiError(404, "notFound");
  const totals = await prisma.order.aggregate({
    where: { ...COUNTED, userId: id },
    _sum: { grandTotal: true },
    _count: true,
  });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    banned: user.banned,
    locale: user.locale,
    createdAt: user.createdAt,
    totalSpent: Number(totals._sum.grandTotal ?? 0),
    completedOrders: totals._count,
    addresses: user.addresses.map((a) => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      division: a.division,
      district: a.district,
      area: a.area,
      addressLine: a.addressLine,
      isDefault: a.isDefault,
    })),
    orders: user.orders.map((o) => ({ ...o, grandTotal: Number(o.grandTotal) })),
  };
}

export type AdminCustomer = Awaited<ReturnType<typeof getCustomer>>;

/** Blocking signs the user out everywhere; they cannot sign in again until unblocked. */
export async function setBanned(
  id: string,
  banned: boolean,
  actor: { id: string; role: UserRole },
) {
  if (id === actor.id) throw new ApiError(400, "cannotChangeSelf");
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user) throw new ApiError(404, "notFound");
  // Like role changes: only ADMIN can lock out staff or admin accounts.
  if (user.role !== "CUSTOMER" && actor.role !== "ADMIN") throw new ApiError(403, "forbidden");
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { banned } }),
    ...(banned ? [prisma.session.deleteMany({ where: { userId: id } })] : []),
  ]);
}

/** ADMIN only. Role changes end the user's sessions so the new role applies at next sign-in. */
export async function setRole(id: string, role: UserRole, actorId: string) {
  if (id === actorId) throw new ApiError(400, "cannotChangeSelf");
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) throw new ApiError(404, "notFound");
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { role } }),
    prisma.session.deleteMany({ where: { userId: id } }),
  ]);
}
