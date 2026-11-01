import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { parseListingParams } from "@/components/storefront/listing/params";
import { ProductListing } from "@/components/storefront/listing/ProductListing";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { findAgeRange, type AgeRangeCode } from "@/server/domain/catalog/age-ranges";

type Props = PageProps<"/[locale]/age/[range]">;

async function load(params: Props["params"]) {
  const { locale, range } = (await params) as { locale: Locale; range: string };
  const age = findAgeRange(range);
  if (!age) return null;
  const t = await getTranslations({ locale, namespace: "Listing" });
  const ta = await getTranslations({ locale, namespace: "Age" });
  const code = age.code as AgeRangeCode;
  const rangeText = ta(`${code}Range`);
  return {
    locale,
    code,
    name: ta(code),
    title: t("ageTitle", { name: ta(code), range: rangeText }),
    description: t("ageDescription", { range: rangeText }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await load(params);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: localeAlternates(`/age/${page.code}`, page.locale),
  };
}

export default async function AgePage({ params, searchParams }: Props) {
  const page = await load(params);
  if (!page) notFound();
  setRequestLocale(page.locale);
  const t = await getTranslations("Breadcrumb");

  return (
    <ProductListing
      title={page.title}
      description={page.description}
      breadcrumbs={[{ label: t("shop"), href: "/shop" }, { label: page.name }]}
      basePath={`/age/${page.code}`}
      params={parseListingParams(await searchParams)}
      fixedAge={page.code}
    />
  );
}
