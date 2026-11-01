import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { getPublishedPage } from "@/server/modules/content/page.service";
import { Prose } from "./Prose";

type Props = { params: Promise<{ locale: string }> };

/**
 * Route module for a CMS page (Admin → Pages). Each content route re-exports this with its slug,
 * so real routes never get shadowed and unknown paths don't hit the database.
 */
export function cmsRoute(slug: string) {
  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const locale = (await params).locale as Locale;
    const page = await getPublishedPage(locale, slug);
    if (!page) return {};
    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription || undefined,
      alternates: localeAlternates(`/${slug}`, locale),
    };
  }

  async function CmsPage({ params }: Props) {
    const locale = (await params).locale as Locale;
    setRequestLocale(locale);
    const page = await getPublishedPage(locale, slug);
    if (!page) notFound();

    return (
      <div className="mx-auto w-full max-w-3xl px-margin-sm py-space-lg md:px-gutter md:py-space-xl">
        <Breadcrumbs items={[{ label: page.title }]} />
        <article className="space-y-space-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-xl">
          <h1 className="font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {page.title}
          </h1>
          <Prose html={page.body} />
        </article>
      </div>
    );
  }

  return { generateMetadata, CmsPage };
}
