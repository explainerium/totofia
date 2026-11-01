"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useGetWishlistQuery, useToggleWishlistMutation } from "@/redux/api/wishlistApi";
import { toast } from "sonner";
import { toastApiError } from "../cart/api-error";

type Props = {
  productId: string;
  className?: string;
  /** Re-render server data after toggling (wishlist page). */
  refresh?: boolean;
};

/** Heart toggle; saved state comes from the guest wishlist cookie. */
export function WishlistButton({ productId, className, refresh }: Props) {
  const t = useTranslations("Wishlist");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const { data } = useGetWishlistQuery();
  const [toggle, { isLoading }] = useToggleWishlistMutation();
  const saved = data?.productIds.includes(productId) ?? false;

  const onClick = async () => {
    try {
      const result = await toggle(productId).unwrap();
      toast.success(result.saved ? t("saved") : t("removed"));
      if (refresh) router.refresh();
    } catch (e) {
      toastApiError(e, tErrors("internal"));
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-pressed={saved}
      aria-label={saved ? t("remove") : t("add")}
      title={saved ? t("remove") : t("add")}
      className={cn(
        "relative z-10 flex size-9 items-center justify-center rounded-full bg-surface-container-lowest/90 shadow-sm backdrop-blur transition-colors hover:text-error disabled:opacity-60",
        saved ? "text-error" : "text-on-surface-variant",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", saved && "fill-current")} />
    </button>
  );
}
