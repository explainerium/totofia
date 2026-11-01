import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { parseListingParams } from "@/components/storefront/listing/params";
import { ProductListing } from "@/components/storefront/listing/ProductListing";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { getCategoryBySlug } from "@/server/modules/catalog/catalog.service";

type Props = PageProps<"/[locale]/category/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const category = await getCategoryBySlug(locale, slug);
  if (!category) return {};
  return {
    title: category.metaTitle || category.name,
    description: category.metaDescription || category.description || undefined,
    alternates: localeAlternates(`/category/${category.slug}`, locale),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const category = await getCategoryBySlug(locale, slug);
  if (!category) notFound();
  const t = await getTranslations("Breadcrumb");

  return (
    <ProductListing
      title={category.name}
      description={category.description}
      breadcrumbs={[{ label: t("shop"), href: "/shop" }, { label: category.name }]}
      basePath={`/category/${category.slug}`}
      params={parseListingParams(await searchParams)}
      category={{ id: category.id, slug: category.slug, childIds: category.childIds }}
    />
  );
}
