import { ImageOff, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { QuickAddButton } from "@/components/storefront/cart/QuickAddButton";
import { WishlistButton } from "@/components/storefront/wishlist/WishlistButton";
import type { ProductCard as Card } from "@/server/modules/catalog/catalog.service";
import { AgeText } from "./AgeText";
import { Price } from "./Price";
import { ProductBadges } from "./ProductBadges";

export const GRID_IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw";

/**
 * Product tile (DESIGN.md › Product Cards). The whole card links to the product page; the heart and
 * the quick-add button (single-variant products) sit above that link.
 */
export function ProductCard({
  product,
  refreshOnWishlist,
}: {
  product: Card;
  refreshOnWishlist?: boolean;
}) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const href = `/product/${product.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-square w-full bg-surface-container-lowest p-space-sm">
        {product.image ? (
          <Image
            src={product.image.grid}
            alt={product.name}
            fill
            unoptimized
            sizes={GRID_IMAGE_SIZES}
            className="rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full place-items-center rounded-xl bg-surface-container text-outline">
            <ImageOff className="size-8" aria-label={t("noImage")} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {!product.inStock ? (
            <span className="rounded-full bg-error-container px-2.5 py-0.5 text-label-sm text-on-error-container">
              {t("outOfStock")}
            </span>
          ) : null}
          <ProductBadges badges={product.badges} />
        </div>
        <WishlistButton
          productId={product.id}
          refresh={refreshOnWishlist}
          className="absolute top-3 right-3"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-space-md p-space-md">
        <div className="space-y-1">
          <p className="text-label-sm text-tertiary">
            <AgeText min={product.ageMinMonths} max={product.ageMaxMonths} />
          </p>
          <h3 className="font-heading text-[16px] leading-snug font-semibold text-on-surface md:text-[17px]">
            <Link href={href} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
          <Price
            amount={product.price}
            compareAt={product.compareAt}
            locale={locale}
            className="pt-1"
          />
        </div>
        {product.quickAddVariantId ? (
          <QuickAddButton
            variantId={product.quickAddVariantId}
            product={{ id: product.id, name: product.name, price: product.price }}
          />
        ) : (
          <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface-container px-space-md py-2.5 text-label-md text-primary transition-colors group-hover:bg-surface-container-high">
            <SlidersHorizontal className="size-4" aria-hidden />
            {product.hasOptions ? t("chooseOptions") : t("viewDetails")}
          </span>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  columns = 4,
  refreshOnWishlist,
}: {
  products: Card[];
  columns?: 3 | 4;
  refreshOnWishlist?: boolean;
}) {
  return (
    <div
      className={
        columns === 4
          ? "grid grid-cols-2 gap-space-sm sm:gap-space-lg lg:grid-cols-4"
          : "grid grid-cols-2 gap-space-sm sm:gap-space-lg xl:grid-cols-3"
      }
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} refreshOnWishlist={refreshOnWishlist} />
      ))}
    </div>
  );
}
