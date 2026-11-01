import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/storefront/auth/ForgotPasswordForm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { authMetadata } from "../auth-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password">) {
  return authMetadata((await params).locale as Locale, "/forgot-password", "forgotMetaTitle");
}

// Without SMTP configured the reset link is only written to the server log (development).
export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[locale]/forgot-password">) {
  setRequestLocale((await params).locale as Locale);
  const t = await getTranslations("Auth");

  return (
    <AuthCard
      title={t("forgotTitle")}
      subtitle={t("forgotSubtitle")}
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
