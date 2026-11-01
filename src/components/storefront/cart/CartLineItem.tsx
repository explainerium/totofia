"use client";

import { ImageOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Price } from "@/components/product/Price";
import { Link } from "@/i18n/navigation";
import { useRemoveCartItemMutation, useSetCartQuantityMutation } from "@/redux/api/cartApi";
import type { CartLine } from "@/server/modules/cart/cart.service";
import { MAX_LINE_QUANTITY } from "@/server/modules/cart/cart.schema";
import { toastApiError } from "./api-error";
import { QuantityStepper } from "./QuantityStepper";

/** One bag line: image, name, options, price, quantity and remove. */
export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const t = useTranslations("Cart");
  const tErrors = useTranslations("Errors");
  const locale = useLocale();
  const [setQuantity, { isLoading: updating }] = useSetCartQuantityMutation();
  const [remove, { isLoading: removing }] = useRemoveCartItemMutation();
  const busy = updating || removing;
  // Stock may have dropped below the line quantity: "+" is then disabled, "−" still works.
  const max = Math.min(line.stock, MAX_LINE_QUANTITY);

  const change = (quantity: number) =>
    setQuantity({ variantId: line.variantId, quantity })
      .unwrap()
      .catch((e) => toastApiError(e, tErrors("internal")));

  return (
    <li className="flex gap-space-md py-space-md" aria-busy={busy}>
      <Link
        href={`/product/${line.slug}`}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-container"
      >
        {line.image ? (
          <Image
            src={line.image}
            alt={line.name}
            fill
            unoptimized
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <ImageOff className="m-auto size-6 h-full text-outline" aria-hidden />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/product/${line.slug}`}
          onClick={onNavigate}
          className="line-clamp-2 text-label-lg text-on-surface hover:text-primary"
        >
          {line.name}
        </Link>
        {line.variantLabel ? (
          <p className="text-body-sm text-on-surface-variant">{line.variantLabel}</p>
        ) : null}
        <Price amount={line.unitPrice} compareAt={line.compareAt} locale={locale} />
        {!line.available ? (
          <p className="rounded-lg bg-error-container px-space-sm py-1 text-body-sm text-on-error-container">
            {t("unavailable")}
          </p>
        ) : null}
        <div className="mt-1 flex items-center justify-between gap-space-sm">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={max}
            onChange={change}
            disabled={busy}
          />
          <button
            type="button"
            onClick={() =>
              remove(line.variantId)
                .unwrap()
                .catch((e) => toastApiError(e, tErrors("internal")))
            }
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-full px-space-sm py-1 text-label-md text-error hover:bg-error-container/60 disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden />
            {t("remove")}
          </button>
        </div>
      </div>
    </li>
  );
}
