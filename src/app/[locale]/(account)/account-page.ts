import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { getSessionUser } from "@/server/auth/session";

/**
 * The signed-in customer, else off to sign-in. Pages render in parallel with the layout, so the
 * layout's check does not protect them (an expired session would crash the page).
 */
export async function requireAccountUser(locale: Locale, path: string) {
  const user = await getSessionUser();
  if (!user) return redirect({ href: { pathname: "/login", query: { next: path } }, locale });
  return user;
}

type TitleKey = "metaTitle" | "ordersTitle" | "addressesTitle" | "profileTitle" | "reviewsTitle";

/** Account pages: localized title, alternates, never indexed. */
export async function accountMetadata(
  locale: Locale,
  path: string,
  key: TitleKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Account" });
  return {
    title: t(key),
    alternates: localeAlternates(path, locale),
    robots: { index: false, follow: false },
  };
}
