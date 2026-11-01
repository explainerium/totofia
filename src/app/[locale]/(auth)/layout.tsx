import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { StorefrontChrome } from "@/components/shared/StorefrontChrome";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children, params }: LayoutProps<"/[locale]">) {
  setRequestLocale(use(params).locale as Locale);

  return (
    <StorefrontChrome>
      <div className="bg-surface-container-low">{children}</div>
    </StorefrontChrome>
  );
}
