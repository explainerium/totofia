"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/axios";
import { formatDate } from "@/lib/format/intl";
import { useAddOrderNoteMutation } from "@/redux/api/orderApi";
import type { AdminOrder } from "@/server/modules/order/order.service";

/** Internal staff notes — never shown to the customer. */
export function OrderNotes({ order }: { order: AdminOrder }) {
  const [body, setBody] = useState("");
  const [add, { isLoading }] = useAddOrderNoteMutation();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    try {
      await add({ id: order.id, body: body.trim() }).unwrap();
      setBody("");
    } catch (e) {
      toast.error(isApiError(e) ? e.message : "Could not save the note.");
    }
  }

  return (
    <Panel title="Internal notes" description="Only staff can see these.">
      <form onSubmit={submit} className="space-y-space-sm">
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. Called customer, delivery after 5 pm"
          maxLength={1000}
        />
        <Button type="submit" size="sm" disabled={isLoading || !body.trim()}>
          Add note
        </Button>
      </form>
      {order.notes.length ? (
        <ul className="space-y-space-sm">
          {order.notes.map((n) => (
            <li key={n.id} className="rounded-lg bg-surface-container-low p-space-sm">
              <p className="text-body-md whitespace-pre-line">{n.body}</p>
              <p className="text-label-sm text-on-surface-variant">
                {n.authorName} · {formatDate(n.createdAt, "en", "medium")}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
