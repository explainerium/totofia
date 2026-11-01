"use client";

import { useState, type ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
} from "@/redux/api/attributeApi";
import {
  attributeValueInput,
  type AttributeValueInput,
} from "@/server/modules/attribute/attribute.schema";
import type { AdminAttribute } from "@/server/modules/attribute/attribute.service";

type Value = AdminAttribute["values"][number];

export function ValueDialog({
  attribute,
  value,
  trigger,
}: {
  attribute: AdminAttribute;
  value?: Value;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [create] = useCreateAttributeValueMutation();
  const [update] = useUpdateAttributeValueMutation();
  const isColor = attribute.code === "color";

  async function onSubmit(values: AttributeValueInput) {
    const data = { ...values, colorHex: values.colorHex || null };
    if (value) await update({ attributeId: attribute.id, valueId: value.id, data }).unwrap();
    else await create({ attributeId: attribute.id, data }).unwrap();
    toast.success(value ? "Value saved." : "Value added.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {value ? "Edit value" : "Add value"} · {attribute.name.en}
          </DialogTitle>
        </DialogHeader>
        {open ? (
          <ProForm
            schema={attributeValueInput}
            defaultValues={{
              code: value?.code ?? "",
              sortOrder: value?.sortOrder ?? attribute.values.length,
              colorHex: value?.colorHex ?? null,
              label: { bn: value?.label.bn ?? "", en: value?.label.en ?? "" },
            }}
            onSubmit={onSubmit}
          >
            <ProInput name="label.en" label="Label (English)" placeholder="0–3 Months" />
            <ProInput name="label.bn" label="Label (বাংলা)" lang="bn" placeholder="০–৩ মাস" />
            <ProInput
              name="code"
              label="Code"
              description="Used in store filter URLs, e.g. 0-3m or sage."
            />
            <ProInput name="sortOrder" label="Sort order" numeric="number" min={0} />
            {isColor ? <ColorField /> : null}
            <DialogFooter>
              <ProSubmit>{value ? "Save" : "Add"}</ProSubmit>
            </DialogFooter>
          </ProForm>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ColorField() {
  const hex = useWatch({ name: "colorHex" }) as string | null;
  return (
    <div className="flex items-end gap-space-sm">
      <ProInput
        name="colorHex"
        emptyAsNull
        label="Swatch color"
        placeholder="#9CAF88"
        shellClassName="flex-1"
      />
      <span
        className="mb-1 size-8 shrink-0 rounded-full border border-outline-variant"
        style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(hex ?? "") ? hex! : "transparent" }}
      />
    </div>
  );
}
