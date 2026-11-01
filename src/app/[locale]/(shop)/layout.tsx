import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { StorefrontChrome } from "@/components/shared/StorefrontChrome";
import type { Locale } from "@/i18n/routing";

// Header and footer read categories and the session on every request (caching: Phase 6).
export const dynamic = "force-dynamic";

export default function ShopLayout({ children, params }: LayoutProps<"/[locale]">) {
  setRequestLocale(use(params).locale as Locale);

  return <StorefrontChrome>{children}</StorefrontChrome>;
}
