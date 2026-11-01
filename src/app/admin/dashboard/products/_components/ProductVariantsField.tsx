"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Panel } from "@/components/dashboard/Panel";
import { FieldShell } from "@/components/form/FieldShell";
import { ProInput } from "@/components/form/ProInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGetAttributesQuery } from "@/redux/api/attributeApi";
import type { AdminAttribute } from "@/server/modules/attribute/attribute.service";
import { emptyVariant, type ProductFormValues } from "./product-form-values";
import { VariantGenerator } from "./VariantGenerator";

const NONE = "__none__";

/** One row per sellable variant (size × color …) with its own SKU, price and stock. */
export function ProductVariantsField() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove, replace } = useFieldArray({ control, name: "variants" });
  const { data: attributes = [] } = useGetAttributesQuery();

  return (
    <Panel
      title="Variants"
      description="At least one. Customers pick options on the product page; stock is per variant."
      actions={
        <div className="flex gap-space-sm">
          <VariantGenerator attributes={attributes} onGenerate={replace} />
          <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant())}>
            <Plus /> Add variant
          </Button>
        </div>
      }
    >
      <FieldShell name="variants">
        <ul className="space-y-space-sm">
          {fields.map((field, i) => (
            <li
              key={field.id}
              className="space-y-space-sm rounded-xl border border-outline-variant/50 p-space-sm"
            >
              <div className="flex flex-wrap items-end gap-space-sm">
                {attributes.map((attribute) => (
                  <AttributeSelect key={attribute.id} index={i} attribute={attribute} />
                ))}
                <ProInput name={`variants.${i}.sku`} label="SKU" shellClassName="w-40" />
                <ProInput
                  name={`variants.${i}.price`}
                  label="Price (৳)"
                  numeric="number"
                  min={0}
                  shellClassName="w-28"
                />
                <ProInput
                  name={`variants.${i}.salePrice`}
                  label="Sale price"
                  numeric="nullable"
                  min={0}
                  shellClassName="w-28"
                />
                <ProInput
                  name={`variants.${i}.stock`}
                  label="Stock"
                  numeric="number"
                  min={0}
                  shellClassName="w-24"
                />
                <Controller
                  control={control}
                  name={`variants.${i}.isActive`}
                  render={({ field: f }) => (
                    <label className="flex h-9 items-center gap-space-xs text-label-md">
                      <Switch checked={Boolean(f.value)} onCheckedChange={f.onChange} />
                      Active
                    </label>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove variant"
                  className="ml-auto"
                  disabled={fields.length === 1}
                  onClick={() => remove(i)}
                >
                  <Trash2 className="text-error" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-space-sm">
                <ProInput
                  name={`variants.${i}.saleStartsAt`}
                  label="Sale starts (optional)"
                  type="datetime-local"
                  emptyAsNull
                  shellClassName="w-56"
                />
                <ProInput
                  name={`variants.${i}.saleEndsAt`}
                  label="Sale ends (optional)"
                  type="datetime-local"
                  emptyAsNull
                  shellClassName="w-56"
                />
                <ProInput
                  name={`variants.${i}.weightGrams`}
                  label="Weight (g)"
                  numeric="nullable"
                  min={0}
                  shellClassName="w-28"
                />
              </div>
            </li>
          ))}
        </ul>
      </FieldShell>
    </Panel>
  );
}

/** Picks one value of an attribute; stored inside the variant's `attributeValueIds`. */
function AttributeSelect({ index, attribute }: { index: number; attribute: AdminAttribute }) {
  const { control } = useFormContext<ProductFormValues>();
  const own = new Set(attribute.values.map((v) => v.id));

  return (
    <Controller
      control={control}
      name={`variants.${index}.attributeValueIds`}
      render={({ field }) => {
        const ids = field.value ?? [];
        const current = ids.find((id) => own.has(id)) ?? NONE;
        return (
          <div className="w-36 space-y-1.5">
            <span className="text-label-md">{attribute.name.en}</span>
            <Select
              value={current}
              onValueChange={(v) =>
                field.onChange([...ids.filter((id) => !own.has(id)), ...(v === NONE ? [] : [v])])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {attribute.values.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }}
    />
  );
}
