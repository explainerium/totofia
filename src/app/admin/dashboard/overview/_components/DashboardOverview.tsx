"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/components/dashboard/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format/intl";
import { useGetDashboardQuery } from "@/redux/api/dashboardApi";
import { ORDER_STATUSES, titleCase } from "../../orders/_components/order-labels";
import { RevenueChart } from "./RevenueChart";

function Kpi({ label, revenue, orders }: { label: string; revenue: number; orders: number }) {
  return (
    <Panel className="space-y-1">
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <p className="text-headline-md">{formatPrice(revenue, "en")}</p>
      <p className="text-body-sm text-on-surface-variant">
        {orders} order{orders === 1 ? "" : "s"}
      </p>
    </Panel>
  );
}

export function DashboardOverview() {
  const { data, isError } = useGetDashboardQuery(undefined, { refetchOnMountOrArgChange: 60 });

  if (isError) return <p>Could not load the dashboard.</p>;
  if (!data) {
    return (
      <div className="grid gap-space-md md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-space-lg">
      <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Today" {...data.today} />
        <Kpi label="Last 7 days" {...data.week} />
        <Kpi label="Last 30 days" {...data.month} />
        <Panel className="space-y-1">
          <p className="text-label-md text-on-surface-variant">New customers (30 days)</p>
          <p className="text-headline-md">{data.newCustomers30d}</p>
          <Link
            href="/admin/dashboard/customers"
            className="text-body-sm text-primary hover:underline"
          >
            View customers
          </Link>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-space-sm">
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/dashboard/orders?status=${status}`}
            className="rounded-full border border-outline-variant/60 bg-surface-container-lowest px-3 py-1 text-label-md hover:border-primary hover:text-primary"
          >
            {titleCase(status)} <span className="font-bold">{data.statusCounts[status] ?? 0}</span>
          </Link>
        ))}
      </div>

      <Panel title="Revenue — last 30 days">
        <RevenueChart data={data.daily} />
      </Panel>

      <div className="grid gap-space-lg lg:grid-cols-2">
        <Panel title="Top products (30 days)">
          {data.topProducts.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">No sales yet.</p>
          ) : (
            <ol className="divide-y divide-outline-variant/50">
              {data.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-space-sm py-2">
                  <span className="w-5 text-label-md text-outline">{i + 1}</span>
                  <Link
                    href={`/admin/dashboard/products/${p.productId}/edit`}
                    className="flex-1 hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <span className="text-body-sm text-on-surface-variant">{p.quantity} sold</span>
                  <span className="w-24 text-right text-body-sm font-medium">
                    {formatPrice(p.revenue, "en")}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
        <Panel
          title="Low stock"
          description="Active variants at or below their low-stock threshold."
        >
          {data.lowStock.length === 0 ? (
            <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <TrendingUp className="size-4" /> Everything is well stocked.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/50">
              {data.lowStock.map((v) => (
                <li key={v.variantId} className="flex items-center gap-space-sm py-2">
                  <AlertTriangle
                    className={v.stock === 0 ? "size-4 text-error" : "size-4 text-tertiary"}
                  />
                  <Link
                    href={`/admin/dashboard/products/${v.productId}/edit`}
                    className="flex-1 hover:text-primary"
                  >
                    {v.name}
                    <span className="ml-2 font-mono text-label-sm text-on-surface-variant">
                      {v.sku}
                    </span>
                  </Link>
                  <span className={v.stock === 0 ? "font-semibold text-error" : "font-semibold"}>
                    {v.stock === 0 ? "Sold out" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
