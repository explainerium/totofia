import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { TrackOrderForm } from "@/components/storefront/order/TrackOrderForm";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/track-order">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Track" });
  return {
    title: t("metaTitle"),
    description: t("description"),
    alternates: localeAlternates("/track-order", locale),
  };
}

export default async function TrackOrderPage({ params }: PageProps<"/[locale]/track-order">) {
  setRequestLocale((await params).locale as Locale);
  const t = await getTranslations("Track");

  return (
    <div className="mx-auto max-w-shop px-margin-sm py-space-lg md:px-gutter md:py-space-xl">
      <Breadcrumbs items={[{ label: t("title") }]} />
      <h1 className="font-heading text-headline-lg-mobile md:text-headline-lg">{t("title")}</h1>
      <p className="mt-1 mb-space-lg text-body-md text-on-surface-variant">{t("description")}</p>
      <TrackOrderForm />
    </div>
  );
}
