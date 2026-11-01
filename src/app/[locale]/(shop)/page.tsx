import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeHero } from "@/components/storefront/home/HomeHero";
import { HomePromo } from "@/components/storefront/home/HomePromo";
import { NewsletterSection } from "@/components/storefront/home/NewsletterSection";
import {
  CategoryGrid,
  FeaturedProducts,
  ShopByAge,
  WhyTrustUs,
} from "@/components/storefront/home/HomeSections";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { getCategoryTree, getFeaturedProducts } from "@/server/modules/catalog/catalog.service";
import { getActiveBanners } from "@/server/modules/content/banner.service";
import { getPublicStoreInfo } from "@/server/modules/setting/setting.service";
import { JsonLd } from "@/lib/seo/JsonLd";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Home" });
  return { title: { absolute: t("metaTitle") }, alternates: localeAlternates("/", locale) };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [categories, featured, heroes, promos, store, tm] = await Promise.all([
    getCategoryTree(locale),
    getFeaturedProducts(locale, 8),
    getActiveBanners("HOME_HERO", locale),
    getActiveBanners("HOME_PROMO", locale),
    getPublicStoreInfo(),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  const home = siteUrl(locale === "bn" ? "/" : `/${locale}`);
  const sameAs = [store.facebookUrl, store.instagramUrl].filter(Boolean);

  return (
    <>
      <HomeHero banner={heroes[0] ?? null} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <HomePromo banners={promos} />
      <ShopByAge />
      <WhyTrustUs />
      <NewsletterSection />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": siteUrl("/#organization"),
              name: tm("siteName"),
              url: siteUrl("/"),
              logo: siteUrl("/icon.svg"),
              ...(store.phone
                ? {
                    contactPoint: {
                      "@type": "ContactPoint",
                      telephone: store.phone,
                      contactType: "customer service",
                      areaServed: "BD",
                    },
                  }
                : {}),
              ...(sameAs.length ? { sameAs } : {}),
            },
            {
              "@type": "WebSite",
              name: tm("siteName"),
              url: home,
              inLanguage: locale === "bn" ? "bn-BD" : "en",
              publisher: { "@id": siteUrl("/#organization") },
              potentialAction: {
                "@type": "SearchAction",
                target: `${home.replace(/\/$/, "")}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
    </>
  );
}
