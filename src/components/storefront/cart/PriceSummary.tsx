"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import type { CheckoutPreview } from "@/server/modules/checkout/checkout.service";

type Props = {
  totals: CheckoutPreview["totals"];
  couponCode: string | null;
  /** null → delivery not known yet (no district chosen). */
  delivery: "known" | "atCheckout" | "selectDistrict";
};

/** Subtotal / discount / delivery / total rows shared by the bag and checkout pages. */
export function PriceSummary({ totals, couponCode, delivery }: Props) {
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const price = (v: number) => formatPrice(v, locale);

  const rows: { label: string; value: string; muted?: boolean }[] = [
    { label: t("subtotal"), value: price(totals.subtotal) },
  ];
  if (totals.discount > 0) {
    rows.push({
      label: t("discount", { code: couponCode ?? "" }),
      value: `−${price(totals.discount)}`,
    });
  }
  if (delivery === "known") {
    rows.push({
      label: t("delivery"),
      value: totals.shippingFee === 0 ? t("free") : price(totals.shippingFee),
    });
  } else {
    rows.push({
      label: t("delivery"),
      value: delivery === "selectDistrict" ? t("selectDistrict") : tCart("deliveryAtCheckout"),
      muted: true,
    });
  }

  return (
    <dl className="space-y-space-sm text-body-md">
      {rows.map((r) => (
        <div key={r.label} className="flex items-start justify-between gap-space-md">
          <dt className="text-on-surface-variant">{r.label}</dt>
          <dd
            className={cn(
              "text-right",
              r.muted ? "text-body-sm text-on-surface-variant" : "text-on-surface",
            )}
          >
            {r.value}
          </dd>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-outline-variant/50 pt-space-sm">
        <dt className="text-label-lg text-on-surface">{t("total")}</dt>
        <dd className="font-heading text-headline-sm text-primary">{price(totals.grandTotal)}</dd>
      </div>
    </dl>
  );
}
