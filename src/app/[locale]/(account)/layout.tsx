import { setRequestLocale } from "next-intl/server";
import { StorefrontChrome } from "@/components/shared/StorefrontChrome";
import { AccountNav } from "@/components/storefront/account/AccountNav";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSessionUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

// proxy.ts already bounces visitors without a session cookie; this verifies the session itself.
export default async function AccountLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  if (!(await getSessionUser())) {
    redirect({ href: { pathname: "/login", query: { next: "/account" } }, locale });
  }

  return (
    <StorefrontChrome>
      <div className="mx-auto grid max-w-shop gap-space-lg px-margin-sm py-space-lg md:px-gutter md:py-space-xl lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-48 lg:self-start">
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </StorefrontChrome>
  );
}
