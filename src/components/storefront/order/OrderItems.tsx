import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatDigits, formatPrice } from "@/lib/format/intl";
import type { CustomerOrderView } from "@/server/modules/order/order.service";

type Props = Pick<
  CustomerOrderView,
  "items" | "subtotal" | "discount" | "shippingFee" | "grandTotal" | "couponCode"
>;

/** Ordered lines and the money breakdown (already in the page language). */
export function OrderItems({
  items,
  subtotal,
  discount,
  shippingFee,
  grandTotal,
  couponCode,
}: Props) {
  const t = useTranslations("Checkout");
  const tOrder = useTranslations("Order");
  const locale = useLocale();
  const price = (v: number) => formatPrice(v, locale);

  return (
    <div className="space-y-space-md">
      <ul className="divide-y divide-outline-variant/40">
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex gap-space-sm py-space-sm">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
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
              <p className="text-label-md text-on-surface">{item.name}</p>
              <p className="text-body-sm text-on-surface-variant">
                {item.variantLabel ? `${item.variantLabel} · ` : ""}
                {tOrder("quantity", { qty: formatDigits(item.quantity, locale) })}
              </p>
            </div>
            <p className="text-label-md whitespace-nowrap">{price(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="space-y-space-xs text-body-md">
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">{t("subtotal")}</dt>
          <dd>{price(subtotal)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">{t("discount", { code: couponCode ?? "" })}</dt>
            <dd>−{price(discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">{t("delivery")}</dt>
          <dd>{shippingFee === 0 ? t("free") : price(shippingFee)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-outline-variant/50 pt-space-sm">
          <dt className="text-label-lg">{t("total")}</dt>
          <dd className="font-heading text-headline-sm text-primary">{price(grandTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
