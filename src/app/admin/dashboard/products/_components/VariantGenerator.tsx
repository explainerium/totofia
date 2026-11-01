"use client";

import { Wand2 } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { AdminAttribute } from "@/server/modules/attribute/attribute.service";
import {
  emptyVariant,
  type ProductFormValues,
  type VariantFormValues,
} from "./product-form-values";

type Props = {
  attributes: AdminAttribute[];
  onGenerate: (variants: VariantFormValues[]) => void;
};

/**
 * Creates one variant per combination of the chosen values (e.g. 3 sizes × 2 colors = 6).
 * Existing variants with the same combination are kept as they are.
 */
export function VariantGenerator({ attributes, onGenerate }: Props) {
  const { getValues } = useFormContext<ProductFormValues>();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Record<string, string[]>>({});

  const groups = attributes
    .map((a) => ({ attribute: a, ids: picked[a.id] ?? [] }))
    .filter((g) => g.ids.length > 0);
  const combos = groups.reduce<string[][]>(
    (acc, g) => acc.flatMap((combo) => g.ids.map((id) => [...combo, id])),
    [[]],
  );
  const count = groups.length ? combos.length : 0;

  function generate() {
    const current = getValues("variants") ?? [];
    const key = (ids: string[]) => [...ids].sort().join("|");
    const existing = new Map(current.map((v) => [key(v.attributeValueIds ?? []), v]));
    const template = current.find((v) => v.sku) ?? emptyVariant();
    const prefix = (getValues("slug") || "SKU").toUpperCase().slice(0, 20);
    const codeOf = (id: string) =>
      attributes.flatMap((a) => a.values).find((v) => v.id === id)?.code ?? "";

    onGenerate(
      combos.map(
        (ids) =>
          existing.get(key(ids)) ?? {
            ...emptyVariant(),
            price: template.price,
            salePrice: template.salePrice,
            sku: [prefix, ...ids.map(codeOf)].join("-").toUpperCase(),
            attributeValueIds: ids,
          },
      ),
    );
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Wand2 /> Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate variants</DialogTitle>
          <DialogDescription>
            Choose values; one variant is created per combination. Variants not in the new set are
            removed from the form (nothing is saved until you click Save).
          </DialogDescription>
        </DialogHeader>
        {attributes.map((a) => (
          <fieldset key={a.id} className="space-y-space-sm">
            <legend className="text-label-lg">{a.name.en}</legend>
            <div className="grid grid-cols-2 gap-space-sm">
              {a.values.map((v) => {
                const checked = (picked[a.id] ?? []).includes(v.id);
                return (
                  <Label key={v.id} className="flex items-center gap-space-sm font-normal">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) =>
                        setPicked((p) => ({
                          ...p,
                          [a.id]:
                            c === true
                              ? [...(p[a.id] ?? []), v.id]
                              : (p[a.id] ?? []).filter((id) => id !== v.id),
                        }))
                      }
                    />
                    {v.label.en}
                  </Label>
                );
              })}
            </div>
          </fieldset>
        ))}
        <DialogFooter>
          <Button type="button" disabled={count === 0} onClick={generate}>
            Create {count} variant{count === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
