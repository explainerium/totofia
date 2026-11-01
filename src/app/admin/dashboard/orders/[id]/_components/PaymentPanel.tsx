"use client";

import { toast } from "sonner";
import { Panel } from "@/components/dashboard/Panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isApiError } from "@/lib/api/axios";
import { useSetPaymentStatusMutation } from "@/redux/api/orderApi";
import type { AdminOrder } from "@/server/modules/order/order.service";
import { GATEWAY_LABEL } from "./OnlinePaymentsPanel";

const OPTIONS = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
  { value: "REFUNDED", label: "Refunded" },
] as const;

export function PaymentPanel({ order }: { order: AdminOrder }) {
  const [setStatus, { isLoading }] = useSetPaymentStatusMutation();

  return (
    <Panel title="Payment">
      <p className="text-body-sm">
        {order.paymentMethod === "COD"
          ? "Cash on delivery"
          : `Online (${GATEWAY_LABEL[order.paymentMethod] ?? order.paymentMethod})`}
      </p>
      <Select
        value={order.paymentStatus}
        disabled={isLoading}
        onValueChange={async (value) => {
          try {
            await setStatus({
              id: order.id,
              paymentStatus: value as AdminOrder["paymentStatus"],
            }).unwrap();
            toast.success("Payment status updated.");
          } catch (e) {
            toast.error(isApiError(e) ? e.message : "Update failed.");
          }
        }}
      >
        <SelectTrigger className="w-full" aria-label="Payment status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-label-sm text-on-surface-variant">
        COD is marked paid on delivery; online orders when the gateway confirms. Changes are logged
        as a note.
      </p>
    </Panel>
  );
}
