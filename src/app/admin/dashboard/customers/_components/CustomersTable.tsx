"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useGetCustomersQuery, type CustomerListParams } from "@/redux/api/customerApi";

const ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const;

export function CustomersTable() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<CustomerListParams["role"] | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const search = useDebounce(q.trim());
  const { data, isFetching, isError } = useGetCustomersQuery({
    page,
    limit: 20,
    q: search || undefined,
    role: role === "ALL" ? undefined : role,
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
            placeholder="Name, email or phone"
            className="pl-9"
          />
        </div>
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v as typeof role);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <p className="p-space-lg">Could not load customers.</p>
      ) : !data ? (
        <div className="space-y-2 p-space-md">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <p className="p-space-lg text-on-surface-variant">No accounts found.</p>
      ) : (
        <Table className={isFetching ? "opacity-60" : undefined}>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total spent</TableHead>
              <TableHead>Last order</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/admin/dashboard/customers/${c.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {c.name}
                  </Link>
                  <div className="flex gap-1">
                    {c.role !== "CUSTOMER" ? (
                      <Badge variant="secondary">{c.role.toLowerCase()}</Badge>
                    ) : null}
                    {c.banned ? <Badge variant="destructive">blocked</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="text-body-sm">
                  {c.email}
                  <div className="text-on-surface-variant">{c.phone ?? "—"}</div>
                </TableCell>
                <TableCell className="text-right">{c.orderCount}</TableCell>
                <TableCell className="text-right">{formatPrice(c.totalSpent, "en")}</TableCell>
                <TableCell className="text-body-sm text-on-surface-variant">
                  {c.lastOrderAt ? formatDate(c.lastOrderAt, "en", "medium") : "—"}
                </TableCell>
                <TableCell className="text-body-sm text-on-surface-variant">
                  {formatDate(c.createdAt, "en", "medium")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-outline-variant/50 p-space-md text-body-sm">
          <span className="text-on-surface-variant">
            {meta.total} accounts · page {meta.page} of {meta.totalPages}
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
