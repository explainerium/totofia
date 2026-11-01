import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { ResetPasswordForm } from "@/components/storefront/auth/ResetPasswordForm";
import type { Locale } from "@/i18n/routing";
import { readAccessToken, RESET_TOKEN_COOKIE } from "@/server/lib/guest-token";
import { authMetadata } from "../auth-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password">) {
  return authMetadata((await params).locale as Locale, "/reset-password", "resetMetaTitle");
}

// better-auth redirects here with `?token=…` (proxy.ts moves it into a cookie), or
// `?error=INVALID_TOKEN` for a bad/expired link.
export default async function ResetPasswordPage({
  params,
  searchParams,
}: PageProps<"/[locale]/reset-password">) {
  setRequestLocale((await params).locale as Locale);
  const { token, error } = await searchParams;
  const t = await getTranslations("Auth");
  const valid = error ? null : await readAccessToken(token, RESET_TOKEN_COOKIE);

  return (
    <AuthCard title={t("resetTitle")} subtitle={t("resetSubtitle")}>
      <ResetPasswordForm token={valid} />
    </AuthCard>
  );
}
