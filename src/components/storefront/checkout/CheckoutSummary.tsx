"use client";

import { ImageOff, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatDigits, formatPrice } from "@/lib/format/intl";
import type { CheckoutPreview } from "@/server/modules/checkout/checkout.service";
import { CouponForm } from "../cart/CouponForm";
import { PriceSummary } from "../cart/PriceSummary";

type Props = {
  preview: CheckoutPreview;
  formId: string;
  submitting: boolean;
  /** Order placed, browser is on its way to the payment gateway. */
  redirecting?: boolean;
  /** Online payment selected → the button says "Pay ৳X". */
  online?: boolean;
};

/** Right column: items, coupon, delivery zone, totals and the place-order button. */
export function CheckoutSummary({ preview, formId, submitting, redirecting, online }: Props) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const { cart, zone, totals, coupon } = preview;
  const blocked = cart.items.some((i) => !i.available);

  return (
    <aside className="space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg lg:sticky lg:top-48">
      <h2 className="font-heading text-headline-sm">{t("summaryTitle")}</h2>
      <ul className="max-h-72 space-y-space-sm overflow-y-auto">
        {cart.items.map((line) => (
          <li key={line.variantId} className="flex gap-space-sm">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  unoptimized
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <ImageOff className="m-auto size-5 h-full text-outline" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-label-md text-on-surface">{line.name}</p>
              <p className="text-body-sm text-on-surface-variant">
                {line.variantLabel ? `${line.variantLabel} · ` : ""}
                {t("quantity", { qty: formatDigits(line.quantity, locale) })}
              </p>
            </div>
            <p className="text-label-md whitespace-nowrap">{formatPrice(line.lineTotal, locale)}</p>
          </li>
        ))}
      </ul>

      <CouponForm code={cart.couponCode} problem={coupon?.problem} />

      {zone ? (
        <p className="rounded-lg bg-surface-container-low px-space-sm py-2 text-body-sm text-on-surface-variant">
          {t("zoneEta", {
            zone: zone.name,
            min: formatDigits(zone.minDays, locale),
            max: formatDigits(zone.maxDays, locale),
          })}
        </p>
      ) : null}

      <PriceSummary
        totals={totals}
        couponCode={coupon && !coupon.problem ? coupon.code : null}
        delivery={zone ? "known" : "selectDistrict"}
      />

      <button
        type="submit"
        form={formId}
        disabled={submitting || blocked}
        className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-label-lg text-on-primary shadow-sm hover:bg-primary-container disabled:opacity-60"
      >
        {redirecting
          ? t("redirecting")
          : submitting
            ? t("placing")
            : online
              ? t("payAmount", { amount: formatPrice(totals.grandTotal, locale) })
              : t("placeOrder")}
      </button>
      <p className="flex items-start gap-space-xs text-body-sm text-on-surface-variant">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        {t("confirmNote")}
      </p>
    </aside>
  );
}
