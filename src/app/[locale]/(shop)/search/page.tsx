import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { parseListingParams } from "@/components/storefront/listing/params";
import { ProductListing } from "@/components/storefront/listing/ProductListing";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";

type Props = PageProps<"/[locale]/search">;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Listing" });
  const { q } = parseListingParams(await searchParams);
  return {
    title: q ? t("searchTitle", { q }) : t("searchPrompt"),
    description: t("searchDescription"),
    alternates: localeAlternates("/search", locale),
    // Result pages are endless combinations — keep them out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("Listing");
  const tb = await getTranslations("Breadcrumb");
  const listing = parseListingParams(await searchParams);

  return (
    <ProductListing
      title={listing.q ? t("searchTitle", { q: listing.q }) : t("searchPrompt")}
      breadcrumbs={[{ label: tb("search") }]}
      basePath="/search"
      params={listing}
    />
  );
}
