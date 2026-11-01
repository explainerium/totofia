"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/axios";
import { useChangeOrderStatusMutation } from "@/redux/api/orderApi";
import type { AdminOrder } from "@/server/modules/order/order.service";

type Status = AdminOrder["status"];

const ACTIONS: Record<Status, { label: string; variant: "default" | "outline" | "destructive" }> = {
  PENDING: { label: "Back to pending", variant: "outline" },
  CONFIRMED: { label: "Confirm order", variant: "default" },
  PROCESSING: { label: "Start packing", variant: "default" },
  SHIPPED: { label: "Mark shipped", variant: "default" },
  DELIVERED: { label: "Mark delivered", variant: "default" },
  CANCELLED: { label: "Cancel order", variant: "destructive" },
  RETURNED: { label: "Mark returned", variant: "destructive" },
};

const HELP: Partial<Record<Status, string>> = {
  CONFIRMED: "The customer gets a confirmation email (if they gave one).",
  SHIPPED: "Add the courier and tracking number — the customer is emailed.",
  DELIVERED: "Cash on delivery is marked as paid. The customer is emailed.",
  CANCELLED: "Items go back into stock and the coupon use is released. The customer is emailed.",
  RETURNED: "Items go back into stock.",
};

/** One button per allowed next status; each opens a confirm dialog. */
export function OrderActions({ order }: { order: AdminOrder }) {
  const [target, setTarget] = useState<Status | null>(null);

  if (order.nextStatuses.length === 0) {
    return (
      <Panel>
        <p className="text-body-sm text-on-surface-variant">
          This order is {order.status.toLowerCase()} — no further status changes.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="Next step" className="space-y-space-sm">
      <div className="flex flex-wrap gap-space-sm">
        {order.nextStatuses.map((s) => (
          <Button key={s} variant={ACTIONS[s].variant} onClick={() => setTarget(s)}>
            {ACTIONS[s].label}
          </Button>
        ))}
      </div>
      {target ? (
        <StatusDialog order={order} status={target} onClose={() => setTarget(null)} />
      ) : null}
    </Panel>
  );
}

function StatusDialog({
  order,
  status,
  onClose,
}: {
  order: AdminOrder;
  status: Status;
  onClose: () => void;
}) {
  const [change, { isLoading }] = useChangeOrderStatusMutation();
  const [note, setNote] = useState("");
  const [courierName, setCourier] = useState(order.courierName ?? "");
  const [trackingCode, setTracking] = useState(order.trackingCode ?? "");
  const needsReason = status === "CANCELLED" || status === "RETURNED";

  async function submit() {
    if (needsReason && !note.trim()) {
      toast.error("Please add a reason.");
      return;
    }
    try {
      await change({
        id: order.id,
        data: {
          status,
          note: note.trim() || undefined,
          courierName: status === "SHIPPED" ? courierName.trim() || undefined : undefined,
          trackingCode: status === "SHIPPED" ? trackingCode.trim() || undefined : undefined,
        },
      }).unwrap();
      toast.success(`Order #${order.number}: ${status.toLowerCase()}.`);
      onClose();
    } catch (e) {
      toast.error(isApiError(e) ? e.message : "Status change failed.");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {ACTIONS[status].label} · #{order.number}
          </DialogTitle>
          {HELP[status] ? <DialogDescription>{HELP[status]}</DialogDescription> : null}
        </DialogHeader>
        {status === "SHIPPED" ? (
          <div className="grid gap-space-md sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="courier">Courier</Label>
              <Input
                id="courier"
                value={courierName}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="Steadfast, Pathao, own rider…"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tracking">Tracking number</Label>
              <Input
                id="tracking"
                value={trackingCode}
                onChange={(e) => setTracking(e.target.value)}
              />
            </div>
          </div>
        ) : null}
        <div className="space-y-1">
          <Label htmlFor="status-note">
            {needsReason ? "Reason (required)" : "Note (optional)"}
          </Label>
          <Textarea
            id="status-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Saved in the order history (not shown to the customer)."
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button variant={ACTIONS[status].variant} disabled={isLoading} onClick={submit}>
            {ACTIONS[status].label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
