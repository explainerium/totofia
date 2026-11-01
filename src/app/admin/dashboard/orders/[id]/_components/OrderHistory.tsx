import { Panel } from "@/components/dashboard/Panel";
import { formatDate } from "@/lib/format/intl";
import type { AdminOrder } from "@/server/modules/order/order.service";
import { titleCase } from "../../_components/order-labels";

export function OrderHistory({ order }: { order: AdminOrder }) {
  return (
    <Panel title="History">
      <ol className="relative space-y-space-md border-l border-outline-variant pl-space-md">
        {order.history.map((h, i) => (
          <li key={i} className="relative">
            <span className="absolute top-1.5 -left-[calc(var(--spacing-space-md)+5px)] size-2.5 rounded-full bg-primary" />
            <p className="text-label-lg">{titleCase(h.status)}</p>
            <p className="text-label-sm text-on-surface-variant">
              {formatDate(h.at, "en", "medium")} · {h.actorName ?? "Customer"}
            </p>
            {h.note ? <p className="text-body-sm">{h.note}</p> : null}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
