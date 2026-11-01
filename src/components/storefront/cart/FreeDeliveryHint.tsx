"use client";

import { Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format/intl";
import { useGetCheckoutPreviewQuery } from "@/redux/api/checkoutApi";

/** Progress towards free delivery inside Dhaka, using the live zone threshold. */
export function FreeDeliveryHint() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { data } = useGetCheckoutPreviewQuery({ district: "dhaka" });
  const threshold = data?.zone?.freeAboveSubtotal ?? null;
  const remaining = data?.totals.freeShippingRemaining ?? null;
  if (!data || threshold === null || remaining === null || data.cart.itemCount === 0) return null;

  const progress = Math.min(100, Math.round(((threshold - remaining) / threshold) * 100));

  return (
    <div className="space-y-space-xs rounded-xl bg-surface-container-low p-space-sm">
      <p className="flex items-center gap-space-xs text-label-md text-primary">
        <Truck className="size-4 shrink-0" aria-hidden />
        {remaining > 0
          ? t("freeDeliveryRemaining", { amount: formatPrice(remaining, locale) })
          : t("freeDeliveryReached")}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high" aria-hidden>
        <div
          className="h-full rounded-full bg-secondary-fixed-dim transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
