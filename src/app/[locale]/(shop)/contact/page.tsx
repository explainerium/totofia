import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { getContactInfo } from "@/components/shared/store-info";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { ContactForm } from "@/components/storefront/content/ContactForm";
import type { Locale } from "@/i18n/routing";
import { localizeDigits } from "@/lib/format/intl";
import { localeAlternates } from "@/lib/seo/alternates";

type Props = PageProps<"/[locale]/contact">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/contact", locale),
  };
}

export default async function ContactPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [t, contact] = await Promise.all([getTranslations("Contact"), getContactInfo(locale)]);

  const rows: { icon: ReactNode; label: string; value: ReactNode }[] = [
    {
      icon: <Phone className="size-5" aria-hidden />,
      label: t("callUs"),
      value: (
        <a href={`tel:${contact.phoneTel}`} className="text-primary hover:underline">
          {localizeDigits(contact.phoneDisplay, locale)}
        </a>
      ),
    },
  ];
  if (contact.whatsappUrl) {
    rows.push({
      icon: <MessageCircle className="size-5" aria-hidden />,
      label: t("whatsapp"),
      value: (
        <a
          href={contact.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          {t("whatsappCta")}
        </a>
      ),
    });
  }
  if (contact.email) {
    rows.push({
      icon: <Mail className="size-5" aria-hidden />,
      label: t("emailUs"),
      value: (
        <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
          {contact.email}
        </a>
      ),
    });
  }
  if (contact.address) {
    rows.push({
      icon: <MapPin className="size-5" aria-hidden />,
      label: t("address"),
      value: localizeDigits(contact.address, locale),
    });
  }

  return (
    <div className="mx-auto w-full max-w-shop px-margin-sm py-space-lg md:px-gutter md:py-space-xl">
      <Breadcrumbs items={[{ label: t("title") }]} />
      <div className="mb-space-lg space-y-space-xs">
        <h1 className="font-heading text-headline-lg-mobile md:text-headline-lg">{t("title")}</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">{t("intro")}</p>
      </div>
      <div className="grid gap-space-lg lg:grid-cols-12">
        <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg lg:col-span-8">
          <h2 className="mb-space-md font-heading text-headline-sm">{t("formTitle")}</h2>
          <ContactForm />
        </section>
        <aside className="space-y-space-md rounded-2xl bg-surface-container-low p-space-md md:p-space-lg lg:col-span-4">
          <h2 className="font-heading text-headline-sm">{t("infoTitle")}</h2>
          <ul className="space-y-space-md">
            {rows.map((r) => (
              <li key={r.label} className="flex gap-space-sm">
                <span className="mt-0.5 text-primary">{r.icon}</span>
                <div>
                  <p className="text-label-md text-on-surface">{r.label}</p>
                  <div className="text-body-md text-on-surface-variant">{r.value}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-body-sm text-on-surface-variant">{t("hours")}</p>
          {contact.facebookUrl || contact.instagramUrl ? (
            <div className="flex flex-wrap gap-space-sm">
              {contact.facebookUrl ? (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-surface px-space-md py-1.5 text-label-md text-primary hover:bg-surface-container"
                >
                  {t("facebook")}
                </a>
              ) : null}
              {contact.instagramUrl ? (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-surface px-space-md py-1.5 text-label-md text-primary hover:bg-surface-container"
                >
                  {t("instagram")}
                </a>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
