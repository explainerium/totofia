import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/storefront/checkout/CheckoutForm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";
import { getSessionUser } from "@/server/auth/session";
import { listAddresses } from "@/server/modules/account/account.service";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Checkout" });
  return {
    title: t("metaTitle"),
    alternates: localeAlternates("/checkout", locale),
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: PageProps<"/[locale]/checkout">) {
  setRequestLocale((await params).locale as Locale);
  const t = await getTranslations("Checkout");
  const user = await getSessionUser();
  const account = user ? { user, addresses: await listAddresses(user.id) } : null;

  return (
    <div className="mx-auto max-w-shop px-margin-sm py-space-lg md:px-gutter md:py-space-xl">
      <Link
        href="/cart"
        className="mb-space-sm inline-flex items-center gap-space-xs text-label-md text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("backToBag")}
      </Link>
      <h1 className="mb-space-lg font-heading text-headline-lg-mobile md:text-headline-lg">
        {t("title")}
      </h1>
      <CheckoutForm account={account} />
    </div>
  );
}
