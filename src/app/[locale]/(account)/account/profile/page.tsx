import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChangePasswordForm } from "@/components/storefront/account/ChangePasswordForm";
import { ProfileForm } from "@/components/storefront/account/ProfileForm";
import type { Locale } from "@/i18n/routing";
import { accountMetadata, requireAccountUser } from "../../account-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/profile">) {
  return accountMetadata((await params).locale as Locale, "/account/profile", "profileTitle");
}

export default async function ProfilePage({ params }: PageProps<"/[locale]/account/profile">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const user = await requireAccountUser(locale, "/account/profile");
  const t = await getTranslations("Account");
  const card =
    "space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg";

  return (
    <div className="space-y-space-lg">
      <section className={card}>
        <div>
          <h1 className="font-heading text-headline-md">{t("profileTitle")}</h1>
          <p className="text-body-md text-on-surface-variant">{t("profileSub")}</p>
        </div>
        <ProfileForm name={user.name} email={user.email} phone={user.phone} locale={user.locale} />
      </section>
      <section className={card}>
        <div>
          <h2 className="font-heading text-headline-sm">{t("passwordTitle")}</h2>
          <p className="text-body-md text-on-surface-variant">{t("passwordSub")}</p>
        </div>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
