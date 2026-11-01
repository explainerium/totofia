import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { RegisterForm } from "@/components/storefront/auth/RegisterForm";
import { safeNext } from "@/components/storefront/auth/safe-next";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { authMetadata, redirectIfSignedIn } from "../auth-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">) {
  return authMetadata((await params).locale as Locale, "/register", "registerMetaTitle");
}

export default async function RegisterPage({
  params,
  searchParams,
}: PageProps<"/[locale]/register">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const nextParam = (await searchParams).next;
  const next = safeNext(typeof nextParam === "string" ? nextParam : null);
  await redirectIfSignedIn(locale, next);
  const t = await getTranslations("Auth");

  return (
    <AuthCard
      title={t("registerTitle")}
      subtitle={t("registerSubtitle")}
      footer={
        <>
          <span className="text-on-surface-variant">{t("haveAccount")}</span>{" "}
          <Link
            href={{ pathname: "/login", query: next !== "/account" ? { next } : {} }}
            className="font-semibold text-primary hover:underline"
          >
            {t("loginLink")}
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}
