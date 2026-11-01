"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { get, useFieldArray, useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format/intl";
import { VariantPicker, type PickedVariant } from "./VariantPicker";

/** Per-line limit of `manualOrderInput`. */
const MAX_QUANTITY = 50;

/** `items` field of the manual order: picked variants with quantities. */
export function OrderItemsField() {
  const { fields, append, update, remove } = useFieldArray({ name: "items" });
  const { errors } = useFormState({ name: "items" });
  // Display info for picked variants (the form only stores variantId + quantity).
  const [info, setInfo] = useState<Record<string, PickedVariant>>({});
  const items = fields as unknown as ({ id: string } & { variantId: string; quantity: number })[];

  function add(variant: PickedVariant) {
    setInfo((prev) => ({ ...prev, [variant.variantId]: variant }));
    const index = items.findIndex((i) => i.variantId === variant.variantId);
    if (index >= 0) {
      const quantity = Math.min(MAX_QUANTITY, items[index].quantity + 1);
      update(index, { ...items[index], quantity });
    } else append({ variantId: variant.variantId, quantity: 1 });
  }

  const total = items.reduce((sum, i) => sum + (info[i.variantId]?.price ?? 0) * i.quantity, 0);
  const error = get(errors, "items") as
    { message?: string; root?: { message?: string } } | undefined;

  return (
    <div className="space-y-space-md">
      <VariantPicker onPick={add} />
      {items.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          No items yet — search a product above.
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant/50">
          {items.map((item, index) => {
            const v = info[item.variantId];
            // Errors on one line (e.g. quantity over the limit) live at items.N.*, not on "items".
            const lineError = get(errors, `items.${index}`) as
              Record<string, { message?: string } | undefined> | undefined;
            const lineMessage = lineError?.quantity?.message ?? lineError?.variantId?.message;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-space-sm py-2">
                <div className="flex-1">
                  <p className="font-medium">{v?.productName}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {v?.label} · <span className="font-mono">{v?.sku}</span> · {v?.stock} in stock
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Decrease"
                    onClick={() =>
                      item.quantity > 1
                        ? update(index, { ...item, quantity: item.quantity - 1 })
                        : remove(index)
                    }
                  >
                    <Minus />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Increase"
                    disabled={item.quantity >= MAX_QUANTITY}
                    onClick={() => update(index, { ...item, quantity: item.quantity + 1 })}
                  >
                    <Plus />
                  </Button>
                </div>
                <span className="w-24 text-right">
                  {v ? formatPrice(v.price * item.quantity, "en") : "—"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="text-error" />
                </Button>
                {lineMessage ? (
                  <p className="basis-full text-body-sm text-error">
                    {item.quantity > MAX_QUANTITY
                      ? `At most ${MAX_QUANTITY} per item.`
                      : "Check this item's quantity."}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {items.length ? (
        <p className="text-right text-body-md">
          Items subtotal: <span className="font-semibold">{formatPrice(total, "en")}</span>
          <span className="block text-body-sm text-on-surface-variant">
            Delivery and coupon are calculated when the order is created.
          </span>
        </p>
      ) : null}
      {error?.message || error?.root?.message ? (
        <p className="text-body-sm text-error">Add at least one item.</p>
      ) : null}
    </div>
  );
}
