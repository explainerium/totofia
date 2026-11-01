"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { trackAddToCart } from "@/lib/analytics/track";
import { useAddCartItemMutation } from "@/redux/api/cartApi";
import { toastApiError } from "./api-error";
import { useCartDrawer } from "./CartDrawerContext";

/** One-tap add for products with a single variant (product cards). */
type Props = {
  variantId: string;
  /** For analytics events. */
  product: { id: string; name: string; price: number | null };
};

export function QuickAddButton({ variantId, product }: Props) {
  const t = useTranslations("Product");
  const tCart = useTranslations("Cart");
  const tErrors = useTranslations("Errors");
  const { setOpen } = useCartDrawer();
  const [add, { isLoading }] = useAddCartItemMutation();

  const onClick = async () => {
    try {
      await add({ variantId, quantity: 1 }).unwrap();
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price ?? 0,
        quantity: 1,
      });
      toast.success(tCart("added"));
      setOpen(true);
    } catch (e) {
      toastApiError(e, tErrors("internal"));
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="relative z-10 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-space-md py-2.5 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
    >
      <ShoppingBag className="size-4" aria-hidden />
      {isLoading ? t("adding") : t("addToCart")}
    </button>
  );
}
