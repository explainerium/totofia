"use client";

import { Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/intl";
import { useGetWishlistQuery } from "@/redux/api/wishlistApi";

/** Header heart with the number of saved products. */
export function WishlistLink() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const { data } = useGetWishlistQuery();
  const count = data?.productIds.length ?? 0;

  return (
    <Link
      href="/wishlist"
      aria-label={t("wishlist")}
      className="relative hidden size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary sm:flex"
    >
      <Heart className="size-5" />
      {count > 0 ? (
        <span className="absolute top-0.5 right-0.5 flex min-w-4 items-center justify-center rounded-full bg-tertiary px-1 text-[10px] leading-4 text-on-tertiary">
          {formatNumber(count, locale)}
        </span>
      ) : null}
    </Link>
  );
}
