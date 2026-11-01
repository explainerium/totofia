import "server-only";
import { prisma } from "../../db/prisma";

const TZ = "Asia/Dhaka";
const EXCLUDED = ["CANCELLED", "RETURNED"] as const;

/** YYYY-MM-DD of a moment on the Dhaka calendar (independent of the server's time zone). */
const dhakaDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

/** Start of "today" in Dhaka time, as a UTC Date. */
function dhakaDayStart(daysAgo = 0) {
  const now = new Date();
  const dhaka = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const offset = now.getTime() - dhaka.getTime();
  dhaka.setHours(0, 0, 0, 0);
  dhaka.setDate(dhaka.getDate() - daysAgo);
  return new Date(dhaka.getTime() + offset);
}

async function salesSince(since: Date) {
  const r = await prisma.order.aggregate({
    where: { createdAt: { gte: since }, status: { notIn: [...EXCLUDED] } },
    _sum: { grandTotal: true },
    _count: true,
  });
  return { revenue: Number(r._sum.grandTotal ?? 0), orders: r._count };
}

export async function getDashboard() {
  const [today, week, month, byStatus, lowStock, series, top, customers] = await Promise.all([
    salesSince(dhakaDayStart(0)),
    salesSince(dhakaDayStart(6)),
    salesSince(dhakaDayStart(29)),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.productVariant.findMany({
      where: {
        isActive: true,
        product: { status: "PUBLISHED" },
        stock: { lte: prisma.productVariant.fields.lowStockThreshold },
      },
      orderBy: { stock: "asc" },
      take: 10,
      select: {
        id: true,
        sku: true,
        stock: true,
        productId: true,
        product: { select: { translations: { where: { locale: "en" }, select: { name: true } } } },
      },
    }),
    prisma.$queryRaw<{ day: Date; revenue: number; orders: bigint }[]>`
      -- created_at is UTC without a zone: mark it as UTC first, then convert to Dhaka time.
      SELECT date_trunc('day', (created_at AT TIME ZONE 'UTC') AT TIME ZONE ${TZ}) AS day,
             COALESCE(SUM(grand_total), 0)::float AS revenue,
             COUNT(*) AS orders
      FROM orders
      WHERE created_at >= ${dhakaDayStart(29)} AND status NOT IN ('CANCELLED', 'RETURNED')
      GROUP BY 1 ORDER BY 1`,
    // By product only: grouping by the name snapshot too listed a renamed product twice.
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: { createdAt: { gte: dhakaDayStart(29) }, status: { notIn: [...EXCLUDED] } },
      },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: dhakaDayStart(29) } } }),
  ]);

  const topNames = new Map(
    (
      await prisma.productTranslation.findMany({
        where: { locale: "en", productId: { in: top.flatMap((t) => t.productId ?? []) } },
        select: { productId: true, name: true },
      })
    ).map((t) => [t.productId, t.name]),
  );

  // Fill missing days so the chart has 30 points.
  const days = Array.from({ length: 30 }, (_, i) => dhakaDate(dhakaDayStart(29 - i)));
  const byDay = new Map(
    series.map((s) => [new Date(s.day).toISOString().slice(0, 10), s] as const),
  );

  return {
    today,
    week,
    month,
    newCustomers30d: customers,
    statusCounts: Object.fromEntries(byStatus.map((s) => [s.status, s._count])) as Record<
      string,
      number
    >,
    lowStock: lowStock.map((v) => ({
      variantId: v.id,
      productId: v.productId,
      sku: v.sku,
      stock: v.stock,
      name: v.product.translations[0]?.name ?? v.sku,
    })),
    topProducts: top.map((t) => ({
      productId: t.productId!,
      name: topNames.get(t.productId!) ?? "(deleted product)",
      quantity: t._sum.quantity ?? 0,
      revenue: Number(t._sum.lineTotal ?? 0),
    })),
    daily: days.map((day) => {
      const s = byDay.get(day);
      return { day, revenue: s ? Number(s.revenue) : 0, orders: s ? Number(s.orders) : 0 };
    }),
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
