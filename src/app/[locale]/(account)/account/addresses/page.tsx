import { getTranslations, setRequestLocale } from "next-intl/server";
import { AddressBook } from "@/components/storefront/account/AddressBook";
import type { Locale } from "@/i18n/routing";
import { accountMetadata } from "../../account-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/addresses">) {
  return accountMetadata((await params).locale as Locale, "/account/addresses", "addressesTitle");
}

export default async function AddressesPage({ params }: PageProps<"/[locale]/account/addresses">) {
  setRequestLocale((await params).locale as Locale);
  const t = await getTranslations("Account");

  return (
    <div className="space-y-space-lg">
      <div>
        <h1 className="font-heading text-headline-md">{t("addressesTitle")}</h1>
        <p className="text-body-md text-on-surface-variant">{t("addressesSub")}</p>
      </div>
      <AddressBook />
    </div>
  );
}
