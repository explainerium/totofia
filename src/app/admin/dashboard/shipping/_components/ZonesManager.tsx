"use client";

import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/axios";
import { formatPrice } from "@/lib/format/intl";
import { findDistrict } from "@/lib/geo/bd";
import {
  useDeleteShippingZoneMutation,
  useGetShippingZonesQuery,
} from "@/redux/api/shippingZoneApi";
import { ZoneDialog } from "./ZoneDialog";

export function ZonesManager() {
  const { data, isError } = useGetShippingZonesQuery();
  const [remove] = useDeleteShippingZoneMutation();

  if (isError) return <p>Could not load shipping zones.</p>;
  if (!data) return <Skeleton className="h-40 w-full" />;

  const hasDefault = data.some((z) => z.isDefault && z.isActive);

  return (
    <div className="space-y-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        {hasDefault ? (
          <span />
        ) : (
          <p className="text-body-sm text-error">
            No active default zone — customers outside the listed districts cannot check out.
          </p>
        )}
        <ZoneDialog
          nextSortOrder={data.length}
          trigger={
            <Button>
              <Plus /> New zone
            </Button>
          }
        />
      </div>
      <div className="grid gap-space-md md:grid-cols-2 xl:grid-cols-3">
        {data.map((zone) => (
          <Panel
            key={zone.id}
            title={zone.name.en}
            description={<span lang="bn">{zone.name.bn}</span>}
            actions={
              <div className="flex gap-1">
                <ZoneDialog
                  zone={zone}
                  nextSortOrder={data.length}
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Edit">
                      <Pencil />
                    </Button>
                  }
                />
                <ConfirmDelete
                  title={`Delete zone “${zone.name.en}”?`}
                  description="Existing orders keep their delivery fee."
                  onConfirm={() =>
                    remove(zone.id)
                      .unwrap()
                      .then(
                        () => toast.success("Zone deleted."),
                        (e) => toast.error(isApiError(e) ? e.message : "Delete failed."),
                      )
                  }
                />
              </div>
            }
          >
            <div className="flex flex-wrap gap-1">
              {zone.isDefault ? <Badge>default</Badge> : null}
              {!zone.isActive ? <Badge variant="outline">inactive</Badge> : null}
              <Badge variant="secondary" className="font-mono">
                {zone.code}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-y-1 text-body-sm">
              <dt className="text-on-surface-variant">Fee</dt>
              <dd>{formatPrice(zone.fee, "en")}</dd>
              <dt className="text-on-surface-variant">Free from</dt>
              <dd>
                {zone.freeAboveSubtotal === null ? "—" : formatPrice(zone.freeAboveSubtotal, "en")}
              </dd>
              <dt className="text-on-surface-variant">Delivery</dt>
              <dd>
                {zone.minDays}–{zone.maxDays} days
              </dd>
            </dl>
            <p className="text-body-sm text-on-surface-variant">
              {zone.districts.length
                ? zone.districts.map((d) => findDistrict(d)?.name.en ?? d).join(", ")
                : zone.isDefault
                  ? "All other districts"
                  : "No districts"}
            </p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
