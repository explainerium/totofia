import "server-only";
import type { Locale, OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { pagination } from "../../http/response";
import { NEXT_STATUSES } from "../../domain/order/transitions";

const detailInclude = {
  items: true,
  address: true,
  statusHistory: { orderBy: { createdAt: "asc" } },
} as const;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof detailInclude }>;

/** Customer-facing view in one language. */
function toCustomerView(order: OrderRow, locale: Locale) {
  return {
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    /** Online order still waiting for payment → show "Pay now". */
    canPayOnline:
      (order.paymentMethod === "SSLCOMMERZ" || order.paymentMethod === "AAMARPAY") &&
      order.paymentStatus === "UNPAID" &&
      order.status === "PENDING",
    createdAt: order.createdAt,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    items: order.items.map((i) => ({
      productId: i.productId,
      name: locale === "bn" ? i.nameBn : i.nameEn,
      variantLabel: locale === "bn" ? i.variantLabelBn : i.variantLabelEn,
      image: i.imageUrl,
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      lineTotal: Number(i.lineTotal),
    })),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shippingFee: Number(order.shippingFee),
    grandTotal: Number(order.grandTotal),
    couponCode: order.couponCode,
    address: order.address,
    history: order.statusHistory.map((h) => ({ status: h.status, at: h.createdAt })),
  };
}

export type CustomerOrderView = ReturnType<typeof toCustomerView>;

/** Order opened with the guest access token (success page / email link). */
export async function getGuestOrder(number: number, token: string, locale: Locale) {
  const order = await prisma.order.findUnique({ where: { number }, include: detailInclude });
  if (!order || order.guestAccessToken !== token) throw new ApiError(404, "orderNotFound");
  return toCustomerView(order, locale);
}

/** Public tracking by order number + phone. Address details are left out. */
export async function trackOrder(number: number, phone: string, locale: Locale) {
  const order = await prisma.order.findUnique({ where: { number }, include: detailInclude });
  if (!order || order.customerPhone !== phone) throw new ApiError(404, "orderNotFound");
  const view = toCustomerView(order, locale);
  return {
    ...view,
    customerPhone: undefined,
    customerEmail: undefined,
    address: order.address ? { district: order.address.district } : null,
  };
}

// ─── Admin (read-only in Phase 2; status changes arrive in Phase 4) ─────────

export async function listAdminOrders(query: {
  page?: number;
  limit?: number;
  q?: string;
  status?: OrderStatus;
}) {
  const { skip, take, meta } = pagination(query);
  // Order numbers are Int; a phone number typed into search ("8801…") would overflow it.
  const number = query.q && /^\d{1,9}$/.test(query.q) ? Number(query.q) : undefined;
  const where: Prisma.OrderWhereInput = {
    status: query.status,
    OR: query.q
      ? [
          ...(number ? [{ number }] : []),
          { customerPhone: { contains: query.q } },
          { customerName: { contains: query.q, mode: "insensitive" } },
        ]
      : undefined,
  };
  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } }, address: { select: { district: true } } },
    }),
    prisma.order.count({ where }),
  ]);
  return {
    items: rows.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      district: o.address?.district ?? null,
      itemCount: o._count.items,
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt,
    })),
    meta: meta(total),
  };
}

export type AdminOrderListItem = Awaited<ReturnType<typeof listAdminOrders>>["items"][number];

export async function getAdminOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      ...detailInclude,
      notes: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) throw new ApiError(404, "notFound");
  return {
    ...toCustomerView(order, "en"),
    id: order.id,
    locale: order.locale,
    source: order.source,
    note: order.note,
    shippingZoneCode: order.shippingZoneCode,
    courierName: order.courierName,
    trackingCode: order.trackingCode,
    guestAccessToken: order.guestAccessToken,
    account: order.user,
    nextStatuses: NEXT_STATUSES[order.status],
    history: order.statusHistory.map((h) => ({
      status: h.status,
      at: h.createdAt,
      note: h.note,
      actorName: h.actorName,
    })),
    notes: order.notes.map((n) => ({
      id: n.id,
      body: n.body,
      authorName: n.authorName,
      createdAt: n.createdAt,
    })),
    items: order.items.map((i) => ({
      sku: i.sku,
      nameEn: i.nameEn,
      nameBn: i.nameBn,
      variantLabel: i.variantLabelEn,
      image: i.imageUrl,
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      lineTotal: Number(i.lineTotal),
    })),
  };
}

export type AdminOrder = Awaited<ReturnType<typeof getAdminOrder>>;
