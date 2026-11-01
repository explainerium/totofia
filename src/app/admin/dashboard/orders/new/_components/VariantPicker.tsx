"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import { useGetAttributesQuery } from "@/redux/api/attributeApi";
import { useGetProductQuery, useGetProductsQuery } from "@/redux/api/productApi";

export type PickedVariant = {
  variantId: string;
  productName: string;
  label: string;
  sku: string;
  price: number;
  stock: number;
};

/** Search published products, then pick one of their active variants. */
export function VariantPicker({ onPick }: { onPick: (variant: PickedVariant) => void }) {
  const [q, setQ] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const search = useDebounce(q.trim());
  const { data, isFetching } = useGetProductsQuery(
    { q: search, status: "PUBLISHED", limit: 8 },
    { skip: search.length < 2 },
  );

  return (
    <div className="space-y-space-sm">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setProductId(null);
          }}
          placeholder="Search product name or SKU (min. 2 letters)"
          className="pl-9"
        />
      </div>
      {search.length >= 2 && !productId ? (
        <ul
          className={cn("rounded-lg border border-outline-variant/50", isFetching && "opacity-60")}
        >
          {data?.items.length === 0 ? (
            <li className="p-space-sm text-body-sm text-on-surface-variant">
              No published products.
            </li>
          ) : null}
          {data?.items.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setProductId(p.id)}
                className="flex w-full items-center justify-between gap-space-sm p-space-sm text-left hover:bg-surface-container-low"
              >
                <span>{p.name.en}</span>
                <span className="text-body-sm text-on-surface-variant">
                  {p.totalStock} in stock
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {productId ? (
        <VariantList
          productId={productId}
          onPick={(v) => {
            onPick(v);
            setProductId(null);
            setQ("");
          }}
        />
      ) : null}
    </div>
  );
}

function VariantList({
  productId,
  onPick,
}: {
  productId: string;
  onPick: (variant: PickedVariant) => void;
}) {
  const { data: product } = useGetProductQuery(productId);
  const { data: attributes = [] } = useGetAttributesQuery();
  if (!product) return <Skeleton className="h-20 w-full" />;

  const labelOf = (ids: string[]) =>
    ids
      .map((id) => attributes.flatMap((a) => a.values).find((v) => v.id === id)?.label.en)
      .filter(Boolean)
      .join(" · ") || "Default";
  const now = new Date();

  return (
    <div className="rounded-lg border border-outline-variant/50 p-space-sm">
      <p className="mb-space-sm text-label-lg">{product.translations.en.name}</p>
      <div className="flex flex-wrap gap-space-sm">
        {product.variants
          .filter((v) => v.isActive)
          .map((v) => {
            const onSale =
              v.salePrice !== null &&
              (!v.saleStartsAt || new Date(v.saleStartsAt) <= now) &&
              (!v.saleEndsAt || new Date(v.saleEndsAt) > now);
            const price = onSale ? v.salePrice! : v.price;
            const label = labelOf(v.attributeValueIds);
            return (
              <Button
                key={v.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={v.stock <= 0}
                onClick={() =>
                  onPick({
                    variantId: v.id!,
                    productName: product.translations.en.name,
                    label,
                    sku: v.sku,
                    price,
                    stock: v.stock,
                  })
                }
              >
                {label} · {formatPrice(price, "en")} ·{" "}
                {v.stock <= 0 ? "sold out" : `${v.stock} left`}
              </Button>
            );
          })}
      </div>
    </div>
  );
}
