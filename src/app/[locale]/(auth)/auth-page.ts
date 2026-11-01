import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { getSessionUser } from "@/server/auth/session";

type AuthTitleKey = "loginMetaTitle" | "registerMetaTitle" | "forgotMetaTitle" | "resetMetaTitle";

/** Shared metadata for the auth pages: localized title, alternates, never indexed. */
export async function authMetadata(
  locale: Locale,
  path: string,
  key: AuthTitleKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Auth" });
  return {
    title: t(key),
    alternates: localeAlternates(path, locale),
    robots: { index: false, follow: false },
  };
}

/** Signed-in customers don't need the sign-in / register pages. */
export async function redirectIfSignedIn(locale: Locale, to: string) {
  if (await getSessionUser()) redirect({ href: to, locale });
}
