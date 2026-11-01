import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { parseListingParams } from "@/components/storefront/listing/params";
import { ProductListing } from "@/components/storefront/listing/ProductListing";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Listing" });
  return {
    title: t("shopTitle"),
    description: t("shopDescription"),
    alternates: localeAlternates("/shop", locale),
  };
}

export default async function ShopPage({ params, searchParams }: PageProps<"/[locale]/shop">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("Listing");

  return (
    <ProductListing
      title={t("shopTitle")}
      description={t("shopDescription")}
      breadcrumbs={[{ label: t("shopTitle") }]}
      basePath="/shop"
      params={parseListingParams(await searchParams)}
    />
  );
}
