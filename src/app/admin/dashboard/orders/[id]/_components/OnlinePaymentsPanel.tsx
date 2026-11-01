"use client";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  useGetOrderPaymentsQuery,
  useRecheckOrderPaymentMutation,
  type OrderPayment,
} from "@/redux/api/orderApi";
import type { AdminOrder } from "@/server/modules/order/order.service";

const statusVariant: Record<
  OrderPayment["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  PAID: "default",
  INITIATED: "secondary",
  FAILED: "destructive",
  CANCELLED: "outline",
};

export const GATEWAY_LABEL: Record<string, string> = {
  SSLCOMMERZ: "SSLCommerz",
  AAMARPAY: "aamarPay",
};

/** Online payment attempts (SSLCommerz / aamarPay) + "check with gateway" for a missed callback. */
export function OnlinePaymentsPanel({ order }: { order: AdminOrder }) {
  const { data: payments } = useGetOrderPaymentsQuery(order.id);
  const [recheck, { isLoading }] = useRecheckOrderPaymentMutation();

  if (order.paymentMethod === "COD" && !payments?.length) return null;

  const onRecheck = async () => {
    try {
      const result = await recheck(order.id).unwrap();
      if (result.paid) toast.success("Gateway confirms payment — order marked paid.");
      else toast.info("No completed payment found on the gateway.");
    } catch (e) {
      toast.error(isApiError(e) ? e.message : "Gateway check failed.");
    }
  };

  return (
    <Panel
      title="Online payments"
      description="Gateway attempts for this order. Unpaid online orders are cancelled automatically after 60 minutes."
      actions={
        order.paymentStatus !== "PAID" ? (
          <Button variant="outline" size="sm" onClick={onRecheck} disabled={isLoading}>
            <RefreshCw className={isLoading ? "animate-spin" : undefined} />
            Check with gateway
          </Button>
        ) : null
      }
    >
      {!payments ? (
        <p className="text-body-sm text-on-surface-variant">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          No payment attempt yet — the customer has not reached the gateway.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gateway</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-body-sm">
                  {GATEWAY_LABEL[p.provider] ?? p.provider}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-body-sm">{p.tranId}</span>
                  {p.bankTranId ? (
                    <div className="font-mono text-label-sm text-on-surface-variant">
                      bank {p.bankTranId}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status]}>{p.status.toLowerCase()}</Badge>
                  {p.failReason ? (
                    <div className="text-label-sm text-error">{p.failReason}</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-right">{formatPrice(p.amount, "en")}</TableCell>
                <TableCell className="text-body-sm">{p.cardType ?? "—"}</TableCell>
                <TableCell className="text-body-sm text-on-surface-variant">
                  {formatDate(p.paidAt ?? p.createdAt, "en", "medium")}{" "}
                  {new Date(p.paidAt ?? p.createdAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
