import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { StoreProviders } from "@/providers/StoreProviders";
import { siteUrl } from "@/lib/site-url";
import { AnalyticsScripts } from "@/lib/analytics/AnalyticsScripts";
import { getAnalyticsConfig } from "@/server/modules/setting/setting.service";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("title"), template: `%s | ${t("siteName")}` },
    description: t("description"),
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: { bn: "/", en: "/en" },
    },
    // Static share images, rendered in a browser so Bangla is shaped correctly (next/og cannot).
    openGraph: {
      siteName: t("siteName"),
      locale: locale === "bn" ? "bn_BD" : "en_US",
      images: [{ url: `/og/og-${locale}.png`, width: 1200, height: 630, alt: t("siteName") }],
    },
    twitter: { card: "summary_large_image", images: [`/og/og-${locale}.png`] },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, analytics] = await Promise.all([
    getTranslations({ locale, namespace: "Common" }),
    getAnalyticsConfig(),
  ]);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <StoreProviders>{children}</StoreProviders>
          {/* No hotkey: sonner appends its "alt+T" hint to the aria-label, which would be English on bn pages. */}
          <Toaster
            position="bottom-right"
            richColors
            hotkey={[]}
            containerAriaLabel={t("notifications")}
          />
        </NextIntlClientProvider>
        <AnalyticsScripts ga4Id={analytics.ga4Id} fbPixelId={analytics.fbPixelId} />
      </body>
    </html>
  );
}
