"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useGetCheckoutPreviewQuery } from "@/redux/api/checkoutApi";
import { CartEmpty } from "./CartEmpty";
import { CartLineItem } from "./CartLineItem";
import { CouponForm } from "./CouponForm";
import { FreeDeliveryHint } from "./FreeDeliveryHint";
import { PriceSummary } from "./PriceSummary";

/** Full bag page: lines on the left, coupon + totals on the right. */
export function CartPageView() {
  const t = useTranslations("Cart");
  const { data: cart, isLoading } = useGetCartQuery();
  const { data: preview } = useGetCheckoutPreviewQuery({});

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
        <CartEmpty />
      </div>
    );
  }

  const hasUnavailable = cart.items.some((i) => !i.available);

  return (
    <div className="grid gap-space-lg lg:grid-cols-12">
      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-space-md lg:col-span-8">
        <ul className="divide-y divide-outline-variant/40">
          {cart.items.map((line) => (
            <CartLineItem key={line.variantId} line={line} />
          ))}
        </ul>
      </section>

      <aside className="space-y-space-md lg:col-span-4">
        <div className="space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md">
          <h2 className="font-heading text-headline-sm">{t("summaryTitle")}</h2>
          <FreeDeliveryHint />
          <CouponForm code={cart.couponCode} problem={preview?.coupon?.problem} />
          {preview ? (
            <PriceSummary
              totals={preview.totals}
              couponCode={cart.couponCode}
              delivery="atCheckout"
            />
          ) : null}
          {hasUnavailable ? (
            <p className="rounded-lg bg-error-container px-space-sm py-2 text-body-sm text-on-error-container">
              {t("unavailable")}
            </p>
          ) : null}
          <Link
            href="/checkout"
            aria-disabled={hasUnavailable}
            className="flex h-12 items-center justify-center gap-space-sm rounded-full bg-primary text-label-lg text-on-primary hover:bg-primary-container aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            {t("checkout")}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <Link
            href="/shop"
            className="block text-center text-label-md text-primary hover:underline"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
