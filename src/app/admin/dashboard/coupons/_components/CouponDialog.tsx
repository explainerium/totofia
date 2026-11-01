"use client";

import { useState, type ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSelect } from "@/components/form/ProSelect";
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
import { useCreateCouponMutation, useUpdateCouponMutation } from "@/redux/api/couponApi";
import { couponAdminInput, type CouponAdminInput } from "@/server/modules/coupon/coupon.schema";
import type { AdminCoupon } from "@/server/modules/coupon/coupon.service";
import { toLocalInput } from "../../_components/datetime";

const typeOptions = [
  { value: "PERCENT", label: "Percent off" },
  { value: "FIXED", label: "Fixed amount off (৳)" },
  { value: "FREE_SHIPPING", label: "Free delivery" },
];

export function CouponDialog({ coupon, trigger }: { coupon?: AdminCoupon; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [create] = useCreateCouponMutation();
  const [update] = useUpdateCouponMutation();

  async function onSubmit(values: CouponAdminInput) {
    if (coupon) await update({ id: coupon.id, data: values }).unwrap();
    else await create(values).unwrap();
    toast.success(coupon ? "Coupon saved." : "Coupon created.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{coupon ? `Edit ${coupon.code}` : "New coupon"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <ProForm
            schema={couponAdminInput}
            defaultValues={{
              code: coupon?.code ?? "",
              type: coupon?.type ?? "PERCENT",
              value: coupon?.value ?? 10,
              minOrder: coupon?.minOrder ?? null,
              maxDiscount: coupon?.maxDiscount ?? null,
              usageLimit: coupon?.usageLimit ?? null,
              perPhoneLimit: coupon?.perPhoneLimit ?? null,
              // datetime-local strings; zod coerces them back to dates.
              startsAt: toLocalInput(coupon?.startsAt) as unknown as Date | null,
              endsAt: toLocalInput(coupon?.endsAt) as unknown as Date | null,
              isActive: coupon?.isActive ?? true,
            }}
            onSubmit={onSubmit}
          >
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProInput name="code" label="Code" placeholder="WELCOME10" className="uppercase" />
              <ProSelect name="type" label="Type" options={typeOptions} />
            </div>
            <ValueFields />
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProInput
                name="usageLimit"
                label="Total uses"
                numeric="nullable"
                description="Empty = unlimited"
              />
              <ProInput
                name="perPhoneLimit"
                label="Uses per phone"
                numeric="nullable"
                description="Empty = unlimited"
              />
              <ProInput name="startsAt" label="Starts" type="datetime-local" emptyAsNull />
              <ProInput name="endsAt" label="Ends" type="datetime-local" emptyAsNull />
            </div>
            <ProSwitch name="isActive" label="Active" />
            <DialogFooter>
              <ProSubmit>{coupon ? "Save" : "Create"}</ProSubmit>
            </DialogFooter>
          </ProForm>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ValueFields() {
  const type = useWatch({ name: "type" }) as CouponAdminInput["type"];
  return (
    <div className="grid gap-space-md sm:grid-cols-3">
      {type !== "FREE_SHIPPING" ? (
        <ProInput
          name="value"
          label={type === "PERCENT" ? "Percent" : "Amount (৳)"}
          numeric="number"
          min={0}
        />
      ) : null}
      <ProInput name="minOrder" label="Min. order (৳)" numeric="nullable" min={0} />
      {type === "PERCENT" ? (
        <ProInput name="maxDiscount" label="Max. discount (৳)" numeric="nullable" min={0} />
      ) : null}
    </div>
  );
}
