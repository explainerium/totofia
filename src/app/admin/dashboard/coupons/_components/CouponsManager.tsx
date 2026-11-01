"use client";

import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isApiError } from "@/lib/api/axios";
import { formatDate, formatPrice } from "@/lib/format/intl";
import { useDeleteCouponMutation, useGetCouponsQuery } from "@/redux/api/couponApi";
import type { AdminCoupon } from "@/server/modules/coupon/coupon.service";
import { CouponDialog } from "./CouponDialog";

function describe(c: AdminCoupon) {
  const value =
    c.type === "PERCENT"
      ? `${c.value}% off${c.maxDiscount !== null ? ` (max ${formatPrice(c.maxDiscount, "en")})` : ""}`
      : c.type === "FIXED"
        ? `${formatPrice(c.value, "en")} off`
        : "Free delivery";
  return c.minOrder !== null ? `${value} · min ${formatPrice(c.minOrder, "en")}` : value;
}

function state(c: AdminCoupon): { label: string; variant: "default" | "secondary" | "outline" } {
  const now = new Date();
  if (!c.isActive) return { label: "inactive", variant: "outline" };
  if (c.endsAt && new Date(c.endsAt) <= now) return { label: "expired", variant: "outline" };
  if (c.startsAt && new Date(c.startsAt) > now) return { label: "scheduled", variant: "secondary" };
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) {
    return { label: "used up", variant: "outline" };
  }
  return { label: "active", variant: "default" };
}

export function CouponsManager() {
  const { data, isError } = useGetCouponsQuery();
  const [remove] = useDeleteCouponMutation();

  return (
    <Panel className="p-0 md:p-0">
      <div className="flex justify-end border-b border-outline-variant/50 p-space-md">
        <CouponDialog
          trigger={
            <Button>
              <Plus /> New coupon
            </Button>
          }
        />
      </div>
      {isError ? (
        <p className="p-space-lg">Could not load coupons.</p>
      ) : !data ? (
        <div className="space-y-2 p-space-md">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="p-space-lg text-on-surface-variant">No coupons yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Valid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => {
              const s = state(c);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell>{describe(c)}</TableCell>
                  <TableCell>
                    {c.usedCount}
                    {c.usageLimit !== null ? ` / ${c.usageLimit}` : ""}
                    {c.perPhoneLimit !== null ? (
                      <div className="text-label-sm text-on-surface-variant">
                        {c.perPhoneLimit} per phone
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-body-sm text-on-surface-variant">
                    {c.startsAt ? formatDate(c.startsAt, "en", "medium") : "—"} →{" "}
                    {c.endsAt ? formatDate(c.endsAt, "en", "medium") : "no end"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <CouponDialog
                        coupon={c}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Edit">
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmDelete
                        title={`Delete coupon ${c.code}?`}
                        description="A coupon that was already used is deactivated instead, so past orders keep their reference."
                        onConfirm={() =>
                          remove(c.id)
                            .unwrap()
                            .then(
                              (r) =>
                                toast.success(
                                  r.deactivated ? "Coupon deactivated." : "Coupon deleted.",
                                ),
                              (e) => toast.error(isApiError(e) ? e.message : "Delete failed."),
                            )
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
