import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { LoginForm } from "@/components/storefront/auth/LoginForm";
import { safeNext } from "@/components/storefront/auth/safe-next";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { authMetadata, redirectIfSignedIn } from "../auth-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  return authMetadata((await params).locale as Locale, "/login", "loginMetaTitle");
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const nextParam = (await searchParams).next;
  const next = safeNext(typeof nextParam === "string" ? nextParam : null);
  await redirectIfSignedIn(locale, next);
  const t = await getTranslations("Auth");

  return (
    <AuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <>
          <span className="text-on-surface-variant">{t("noAccount")}</span>{" "}
          <Link
            href={{ pathname: "/register", query: next !== "/account" ? { next } : {} }}
            className="font-semibold text-primary hover:underline"
          >
            {t("registerLink")}
          </Link>
          <p className="mt-space-sm text-body-sm text-on-surface-variant">{t("guestNote")}</p>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
