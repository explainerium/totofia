import { Banknote, RefreshCcw, Ruler, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AgeText } from "@/components/product/AgeText";
import { ProductGrid } from "@/components/product/ProductCard";
import { ProductBadges } from "@/components/product/ProductBadges";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ReviewSummary, ReviewsSection } from "@/components/product/ProductReviews";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { Prose } from "@/components/storefront/content/Prose";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { JsonLd } from "@/lib/seo/JsonLd";
import { TrackEvent } from "@/lib/analytics/TrackEvent";
import { siteUrl } from "@/lib/site-url";
import {
  getProductBySlug,
  getRelatedProducts,
  type ProductDetail,
} from "@/server/modules/catalog/catalog.service";
import { productReviews, type ProductReviews } from "@/server/modules/review/review.service";

type Props = PageProps<"/[locale]/product/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const product = await getProductBySlug(locale, slug);
  if (!product) return {};
  const image = product.images[0];
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || undefined,
    alternates: localeAlternates(`/product/${product.slug}`, locale),
    openGraph: image ? { images: [{ url: image.detail, alt: image.alt }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const product = await getProductBySlug(locale, slug);
  if (!product) notFound();

  const [t, tb, tm, related, reviews] = await Promise.all([
    getTranslations("Product"),
    getTranslations("Breadcrumb"),
    getTranslations("Metadata"),
    getRelatedProducts(locale, product.id, product.category?.id),
    productReviews(product.id),
  ]);

  const crumbs = [
    { label: tb("shop"), href: "/shop" },
    ...(product.category
      ? [{ label: product.category.name, href: `/category/${product.category.slug}` }]
      : []),
    { label: product.name },
  ];
  const delivery = [
    { icon: Truck, text: t("deliveryDhaka") },
    { icon: Truck, text: t("deliveryOutside") },
    { icon: Banknote, text: t("deliveryCod") },
    { icon: RefreshCcw, text: t("deliveryReturn") },
  ];

  return (
    <div className="mx-auto w-full max-w-shop px-margin-sm py-space-lg md:px-gutter">
      <Breadcrumbs items={crumbs} />

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2 lg:gap-space-xl">
        <ProductGallery images={product.images} />

        <div className="space-y-space-md">
          <ProductBadges badges={product.badges} />
          <h1 className="text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
            {product.name}
          </h1>
          <ReviewSummary reviews={reviews} />
          <p className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-label-md text-tertiary">
            <AgeText min={product.ageMinMonths} max={product.ageMaxMonths} />
            <Link
              href="/size-guide"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Ruler className="size-4" aria-hidden />
              {t("sizeGuide")}
            </Link>
          </p>
          {product.shortDescription ? (
            <p className="text-body-lg text-on-surface-variant">{product.shortDescription}</p>
          ) : null}
          <ProductPurchase
            options={product.options}
            variants={product.variants}
            product={{ id: product.id, name: product.name }}
          />

          <ul className="grid grid-cols-1 gap-space-sm rounded-2xl bg-surface-container-low p-space-md sm:grid-cols-2">
            <li className="col-span-full text-label-lg text-on-surface">{t("deliveryTitle")}</li>
            {delivery.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-space-sm text-body-sm text-on-surface-variant"
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-space-xl grid grid-cols-1 gap-space-lg lg:grid-cols-3">
        {product.description ? (
          <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-2">
            <h2 className="mb-space-sm text-headline-sm text-on-surface">{t("description")}</h2>
            {/* Sanitized by the product service when saved. */}
            <Prose html={product.description} className="space-y-space-sm" />
          </section>
        ) : null}
        {product.materialCare ? (
          <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="mb-space-sm text-headline-sm text-on-surface">{t("materialCare")}</h2>
            <p className="text-body-md whitespace-pre-line text-on-surface-variant">
              {product.materialCare}
            </p>
          </section>
        ) : null}
      </div>

      <ReviewsSection reviews={reviews} />

      {related.length ? (
        <section className="mt-space-xl">
          <h2 className="mb-space-lg text-headline-md font-bold text-on-surface">{t("related")}</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}

      <TrackEvent
        event="view_item"
        item={{ id: product.id, name: product.name, price: product.variants[0]?.price ?? 0 }}
      />
      <JsonLd data={productJsonLd(product, locale, tm("siteName"), reviews)} />
    </div>
  );
}

function productJsonLd(
  product: ProductDetail,
  locale: Locale,
  brand: string,
  reviews: ProductReviews,
) {
  const prices = product.variants.map((v) => v.price);
  const inStock = product.variants.some((v) => v.stock > 0);
  const path = `${locale === "bn" ? "" : `/${locale}`}/product/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription || product.shortDescription || undefined,
    image: product.images.map((i) => siteUrl(i.zoom)),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BDT",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: siteUrl(path),
    },
    ...(reviews.count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Math.round(reviews.average * 10) / 10,
            reviewCount: reviews.count,
          },
          review: reviews.items.slice(0, 5).map((r) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            author: { "@type": "Person", name: r.author },
            reviewBody: r.body,
            // Cached data: createdAt may arrive as an ISO string.
            datePublished: new Date(r.createdAt).toISOString().slice(0, 10),
          })),
        }
      : {}),
  };
}
