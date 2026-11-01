import { Heart } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductGrid } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { readGuestToken, WISHLIST_COOKIE } from "@/server/lib/guest-token";
import { wishlistCards } from "@/server/modules/wishlist/wishlist.service";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/wishlist">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Wishlist" });
  return {
    title: t("metaTitle"),
    alternates: localeAlternates("/wishlist", locale),
    robots: { index: false, follow: false },
  };
}

export default async function WishlistPage({ params }: PageProps<"/[locale]/wishlist">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("Wishlist");
  const tCart = await getTranslations("Cart");
  const products = await wishlistCards(await readGuestToken(WISHLIST_COOKIE), locale);

  return (
    <div className="mx-auto max-w-shop px-margin-sm py-space-lg md:px-gutter md:py-space-xl">
      <Breadcrumbs items={[{ label: t("title") }]} />
      <div className="mb-space-lg flex flex-wrap items-baseline gap-space-sm">
        <h1 className="font-heading text-headline-lg-mobile md:text-headline-lg">{t("title")}</h1>
        {products.length ? (
          <span className="text-body-md text-on-surface-variant">
            {t("count", { count: products.length })}
          </span>
        ) : null}
      </div>

      {products.length ? (
        <ProductGrid products={products} refreshOnWishlist />
      ) : (
        <div className="flex flex-col items-center gap-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest py-space-xl text-center">
          <span className="grid size-16 place-items-center rounded-full bg-surface-container text-error">
            <Heart className="size-7" aria-hidden />
          </span>
          <div className="space-y-1 px-space-md">
            <p className="font-heading text-headline-sm">{t("empty")}</p>
            <p className="text-body-md text-on-surface-variant">{t("emptyBody")}</p>
          </div>
          <Link
            href="/shop"
            className="rounded-full bg-primary px-space-lg py-3 text-label-lg text-on-primary hover:bg-primary-container"
          >
            {tCart("continueShopping")}
          </Link>
        </div>
      )}
    </div>
  );
}
