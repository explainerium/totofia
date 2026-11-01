"use client";

import { Check, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { toastApiError } from "@/components/storefront/cart/api-error";
import { useCartDrawer } from "@/components/storefront/cart/CartDrawerContext";
import { useRouter } from "@/i18n/navigation";
import { discountPercent, formatNumber } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics/track";
import { useAddCartItemMutation } from "@/redux/api/cartApi";
import type { ProductDetail } from "@/server/modules/catalog/catalog.service";
import { Price } from "./Price";
import { initialSelection, matchVariant, selectValue, valueState } from "./variant-selection";

const MAX_QTY = 10;

type Props = Pick<ProductDetail, "options" | "variants"> & {
  /** For analytics events. */
  product: { id: string; name: string };
};

/** Price, option pickers, stock status, quantity, add to bag and buy now. */
export function ProductPurchase({ options, variants, product }: Props) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const [selection, setSelection] = useState(() => initialSelection(options, variants));
  const [qty, setQty] = useState(1);
  const tCart = useTranslations("Cart");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const { setOpen } = useCartDrawer();
  const [addItem, { isLoading: adding }] = useAddCartItemMutation();

  const variant =
    matchVariant(options, variants, selection) ?? (options.length ? null : variants[0]);
  const shown = variant ?? variants[0];
  const maxQty = Math.max(1, Math.min(variant?.stock ?? 1, MAX_QTY));
  const quantity = Math.min(qty, maxQty);
  const canBuy = Boolean(variant && variant.stock > 0) && !adding;

  const add = async (then: "drawer" | "checkout") => {
    if (!variant) return;
    try {
      await addItem({ variantId: variant.id, quantity }).unwrap();
      trackAddToCart({ id: product.id, name: product.name, price: variant.price, quantity });
      if (then === "checkout") {
        router.push("/checkout");
      } else {
        toast.success(tCart("added"));
        setOpen(true);
      }
    } catch (e) {
      toastApiError(e, tErrors("internal"));
    }
  };

  const percent = shown?.compareAt ? discountPercent(shown.price, shown.compareAt) : 0;

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-center gap-space-sm">
        <Price
          amount={shown?.price ?? null}
          compareAt={shown?.compareAt}
          locale={locale}
          size="lg"
        />
        {percent > 0 ? (
          <span className="rounded-full bg-error-container px-2.5 py-0.5 text-label-sm text-on-error-container">
            {t("discount", { percent: formatNumber(percent, locale) })}
          </span>
        ) : null}
      </div>

      {options.map((option) => {
        const selected = option.values.find((v) => v.id === selection[option.code]);
        const isColor = option.code === "color";
        return (
          <fieldset key={option.code} className="space-y-space-sm">
            <legend className="text-label-lg text-on-surface">
              {selected
                ? t("selected", { value: selected.label })
                : t("selectOption", { name: option.name })}
            </legend>
            <div className="flex flex-wrap gap-space-sm">
              {option.values.map((value) => {
                const state = valueState(options, variants, selection, option.code, value.id);
                const active = value.id === selection[option.code];
                return (
                  <button
                    key={value.id}
                    type="button"
                    disabled={state === "none"}
                    aria-pressed={active}
                    aria-label={isColor ? value.label : undefined}
                    title={isColor ? value.label : undefined}
                    onClick={() =>
                      setSelection((s) => selectValue(options, variants, s, option.code, value.id))
                    }
                    className={cn(
                      "transition-all disabled:cursor-not-allowed disabled:opacity-30",
                      isColor
                        ? "flex size-10 items-center justify-center rounded-full border-2"
                        : "min-w-12 rounded-lg border px-space-md py-2 text-label-md",
                      isColor &&
                        (active
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-outline-variant/60"),
                      !isColor &&
                        (active
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary"),
                      state === "out" && !active && "line-through opacity-60",
                      // Clickable: switches the other options to a combination that exists.
                      state === "swap" && !active && "border-dashed opacity-50",
                    )}
                    style={isColor ? { backgroundColor: value.colorHex ?? undefined } : undefined}
                  >
                    {isColor ? (
                      active ? (
                        <Check className="size-4 text-on-surface" aria-hidden />
                      ) : null
                    ) : (
                      value.label
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <p
        className={cn(
          "inline-flex rounded-full px-3 py-1 text-label-md",
          !variant
            ? "bg-surface-container text-on-surface-variant"
            : variant.stock === 0
              ? "bg-error-container text-on-error-container"
              : variant.lowStock
                ? "bg-tertiary-fixed text-on-tertiary-fixed"
                : "bg-secondary-fixed/60 text-on-secondary-fixed-variant",
        )}
      >
        {!variant
          ? t("unavailable")
          : variant.stock === 0
            ? t("outOfStock")
            : variant.lowStock
              ? t("lowStock", { count: variant.stock })
              : t("inStock")}
      </p>

      <div className="flex flex-wrap items-center gap-space-md">
        <div className="flex items-center rounded-full border border-outline-variant bg-surface-container-lowest">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label={t("decrease")}
            className="flex size-11 items-center justify-center rounded-full disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <output aria-label={t("quantity")} className="min-w-8 text-center text-label-lg">
            {formatNumber(quantity, locale)}
          </output>
          <button
            type="button"
            onClick={() => setQty(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
            aria-label={t("increase")}
            className="flex size-11 items-center justify-center rounded-full disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => add("drawer")}
          disabled={!canBuy}
          className="inline-flex h-12 flex-1 items-center justify-center gap-space-sm rounded-full bg-primary px-space-lg text-label-lg text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60 sm:flex-none"
        >
          <ShoppingBag className="size-5" aria-hidden />
          {adding ? t("adding") : t("addToCart")}
        </button>
        <button
          type="button"
          onClick={() => add("checkout")}
          disabled={!canBuy}
          className="inline-flex h-12 flex-1 items-center justify-center gap-space-sm rounded-full border-[1.5px] border-primary px-space-lg text-label-lg text-primary transition-colors hover:bg-secondary-fixed/30 disabled:opacity-60 sm:flex-none"
        >
          <Zap className="size-5" aria-hidden />
          {t("buyNow")}
        </button>
      </div>
    </div>
  );
}
