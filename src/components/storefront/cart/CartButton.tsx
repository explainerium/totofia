"use client";

import { ShoppingBag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { formatNumber, formatPrice } from "@/lib/format/intl";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { CartEmpty } from "./CartEmpty";
import { useCartDrawer } from "./CartDrawerContext";
import { CartLineItem } from "./CartLineItem";
import { FreeDeliveryHint } from "./FreeDeliveryHint";

/** Header bag button with live count; opens the slide-over cart (DESIGN.md › Cart Drawer). */
export function CartButton() {
  const t = useTranslations("Cart");
  const tHeader = useTranslations("Header");
  const locale = useLocale();
  const { open, setOpen } = useCartDrawer();
  const { data: cart } = useGetCartQuery();
  const count = cart?.itemCount ?? 0;
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t("open")} — ${t("itemCount", { count })}`}
        className="flex items-center gap-space-sm rounded-full bg-primary px-space-md py-2 text-on-primary transition-colors hover:bg-primary-container"
      >
        <ShoppingBag className="size-5" aria-hidden />
        <span className="hidden text-label-md sm:inline">{tHeader("cart")}</span>
        {count > 0 ? (
          <span className="min-w-5 rounded-full bg-on-primary px-1 text-center text-label-sm text-primary">
            {formatNumber(count, locale)}
          </span>
        ) : null}
      </button>

      {/* Own close button: the default one carries an English screen-reader label. */}
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className="w-full gap-0 bg-surface p-0 shadow-overlay sm:max-w-[420px]"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 p-space-md">
          <SheetTitle className="font-heading text-headline-sm text-on-surface">
            {t("title")}
            {count > 0 ? (
              <span className="ml-2 text-body-sm font-normal text-on-surface-variant">
                ({t("itemCount", { count })})
              </span>
            ) : null}
          </SheetTitle>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <X className="size-5" />
          </button>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="flex-1 overflow-y-auto px-space-md">
            <CartEmpty onNavigate={close} />
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-outline-variant/40 overflow-y-auto px-space-md">
              {cart.items.map((line) => (
                <CartLineItem key={line.variantId} line={line} onNavigate={close} />
              ))}
            </ul>
            <div className="space-y-space-md border-t border-outline-variant/40 bg-surface-container-lowest p-space-md">
              <FreeDeliveryHint />
              <div className="flex items-center justify-between text-label-lg">
                <span>{t("subtotal")}</span>
                <span className="font-heading text-headline-sm text-on-surface">
                  {formatPrice(cart.subtotal, locale)}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant">{t("deliveryAtCheckout")}</p>
              <div className="grid grid-cols-2 gap-space-sm">
                <Link
                  href="/cart"
                  onClick={close}
                  className="rounded-full border-[1.5px] border-primary px-space-md py-3 text-center text-label-lg text-primary hover:bg-secondary-fixed/30"
                >
                  {t("viewBag")}
                </Link>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="rounded-full bg-primary px-space-md py-3 text-center text-label-lg text-on-primary hover:bg-primary-container"
                >
                  {t("checkout")}
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
