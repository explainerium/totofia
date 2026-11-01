import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { CartPageView } from "@/components/storefront/cart/CartPageView";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Cart" });
  return {
    title: t("metaTitle"),
    alternates: localeAlternates("/cart", locale),
    robots: { index: false, follow: false },
  };
}

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  setRequestLocale((await params).locale as Locale);
  const t = await getTranslations("Cart");

  return (
    <div className="mx-auto max-w-shop px-margin-sm py-space-lg md:px-gutter md:py-space-xl">
      <Breadcrumbs items={[{ label: t("title") }]} />
      <h1 className="mb-space-lg font-heading text-headline-lg-mobile md:text-headline-lg">
        {t("title")}
      </h1>
      <CartPageView />
    </div>
  );
}
