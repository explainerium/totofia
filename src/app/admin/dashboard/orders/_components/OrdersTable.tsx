"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate, formatPrice } from "@/lib/format/intl";
import { findDistrict } from "@/lib/geo/bd";
import { useGetOrdersQuery, type OrderListParams } from "@/redux/api/orderApi";
import { ORDER_STATUSES, statusVariant, titleCase } from "./order-labels";

export function OrdersTable() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Status lives in the URL so dashboard chips can link to a filtered list.
  const statusParam = params.get("status");
  const status = (ORDER_STATUSES as string[]).includes(statusParam ?? "")
    ? (statusParam as NonNullable<OrderListParams["status"]>)
    : "ALL";
  const [page, setPage] = useState(1);
  const setStatus = (next: typeof status) => {
    setPage(1);
    router.replace(next === "ALL" ? pathname : `${pathname}?status=${next}`, { scroll: false });
  };
  const search = useDebounce(q.trim());

  const { data, isFetching, isError } = useGetOrdersQuery({
    page,
    limit: 20,
    q: search || undefined,
    status: status === "ALL" ? undefined : status,
  });
  const meta = data?.meta;

  return (
    <Panel className="p-0 md:p-0">
      <div className="flex flex-wrap gap-space-sm border-b border-outline-variant/50 p-space-md">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Order number, phone or name"
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/50 px-space-md py-space-sm">
        {(["ALL", ...ORDER_STATUSES] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "ghost"}
            onClick={() => setStatus(s)}
          >
            {s === "ALL" ? "All" : titleCase(s)}
          </Button>
        ))}
      </div>

      {isError ? (
        <p className="p-space-lg">Could not load orders.</p>
      ) : !data ? (
        <div className="space-y-2 p-space-md">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <p className="p-space-lg text-on-surface-variant">No orders found.</p>
      ) : (
        <Table className={isFetching ? "opacity-60" : undefined}>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link
                    href={`/admin/dashboard/orders/${o.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    #{o.number}
                  </Link>
                  <div className="text-label-sm text-on-surface-variant">
                    {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                  </div>
                </TableCell>
                <TableCell className="text-body-sm text-on-surface-variant">
                  {formatDate(o.createdAt, "en", "medium")}
                </TableCell>
                <TableCell>
                  {o.customerName}
                  <div className="text-body-sm text-on-surface-variant">{o.customerPhone}</div>
                </TableCell>
                <TableCell>
                  {o.district ? (findDistrict(o.district)?.name.en ?? o.district) : "—"}
                </TableCell>
                <TableCell className="text-right">{formatPrice(o.grandTotal, "en")}</TableCell>
                <TableCell className="text-body-sm">
                  {o.paymentMethod} · {o.paymentStatus.toLowerCase()}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[o.status]}>{o.status.toLowerCase()}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-outline-variant/50 p-space-md text-body-sm">
          <span className="text-on-surface-variant">
            {meta.total} orders · page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((n) => n - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((n) => n + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
