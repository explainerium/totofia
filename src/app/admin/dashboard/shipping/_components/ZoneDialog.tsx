"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CheckboxList } from "@/components/form/ProCheckbox";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProSwitch } from "@/components/form/ProSwitch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DIVISION_CODES, DIVISIONS, districtsOf } from "@/lib/geo/bd";
import {
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
} from "@/redux/api/shippingZoneApi";
import {
  shippingZoneInput,
  type ShippingZoneInput,
} from "@/server/modules/shipping/shipping.schema";
import type { ShippingZone } from "@/server/modules/shipping/shipping.service";

export function ZoneDialog({
  zone,
  nextSortOrder,
  trigger,
}: {
  zone?: ShippingZone;
  nextSortOrder: number;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [create] = useCreateShippingZoneMutation();
  const [update] = useUpdateShippingZoneMutation();

  async function onSubmit(values: ShippingZoneInput) {
    if (zone) await update({ id: zone.id, data: values }).unwrap();
    else await create(values).unwrap();
    toast.success(zone ? "Zone saved." : "Zone created.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{zone ? `Edit ${zone.name.en}` : "New shipping zone"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <ProForm
            schema={shippingZoneInput}
            defaultValues={{
              code: zone?.code ?? "",
              name: { bn: zone?.name.bn ?? "", en: zone?.name.en ?? "" },
              fee: zone?.fee ?? 0,
              freeAboveSubtotal: zone?.freeAboveSubtotal ?? null,
              minDays: zone?.minDays ?? 1,
              maxDays: zone?.maxDays ?? 3,
              districts: zone?.districts ?? [],
              isDefault: zone?.isDefault ?? false,
              isActive: zone?.isActive ?? true,
              sortOrder: zone?.sortOrder ?? nextSortOrder,
            }}
            onSubmit={onSubmit}
          >
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProInput name="name.en" label="Name (English)" placeholder="Inside Dhaka" />
              <ProInput
                name="name.bn"
                label="Name (বাংলা)"
                lang="bn"
                placeholder="ঢাকা সিটির ভেতরে"
              />
              <ProInput name="code" label="Code" description="e.g. inside-dhaka" />
              <ProInput name="sortOrder" label="Sort order" numeric="number" min={0} />
              <ProInput name="fee" label="Delivery fee (৳)" numeric="number" min={0} />
              <ProInput
                name="freeAboveSubtotal"
                label="Free delivery from (৳)"
                numeric="nullable"
                description="Empty = never free"
              />
              <ProInput name="minDays" label="Min. days" numeric="number" min={0} />
              <ProInput name="maxDays" label="Max. days" numeric="number" min={0} />
            </div>
            <ProSwitch
              name="isDefault"
              label="Default zone"
              description="Used for every district that is not listed in another zone."
            />
            <ProSwitch name="isActive" label="Active" />
            <div className="space-y-space-sm">
              <p className="text-label-md">Districts</p>
              <p className="text-body-sm text-on-surface-variant">
                A district can only be in one zone — selecting it here removes it from its current
                zone.
              </p>
              <div className="grid gap-space-md sm:grid-cols-2 lg:grid-cols-4">
                {DIVISION_CODES.map((division) => (
                  <div key={division} className="space-y-space-sm">
                    <p className="text-label-md text-primary">{DIVISIONS[division].en}</p>
                    <CheckboxList
                      name="districts"
                      options={districtsOf(division).map((d) => ({
                        value: d.code,
                        label: d.name.en,
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <ProSubmit>{zone ? "Save" : "Create"}</ProSubmit>
            </DialogFooter>
          </ProForm>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
