import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDigits, localizeDigits } from "@/lib/format/intl";
import { getCategoryTree } from "@/server/modules/catalog/catalog.service";
import { LanguageSwitcher } from "../header/LanguageSwitcher";
import { Logo } from "../Logo";
import { getContactInfo } from "../store-info";

// Content pages are managed in Admin → Pages (same slugs).
const supportLinks = [
  ["/track-order", "trackOrder"],
  ["/shipping-delivery", "shipping"],
  ["/return-policy", "returns"],
  ["/size-guide", "sizeGuide"],
  ["/faq", "faq"],
  ["/contact", "contact"],
] as const;
const policyLinks = [
  ["/about", "aboutUs"],
  ["/privacy", "privacy"],
  ["/terms", "terms"],
] as const;

export async function SiteFooter() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Footer");
  const [categories, contact] = await Promise.all([
    getCategoryTree(locale),
    getContactInfo(locale),
  ]);

  const column = (title: string, links: { href: string; label: string }[]) => (
    <div className="space-y-space-md">
      <h2 className="text-label-lg text-on-surface">{title}</h2>
      <ul className="space-y-space-sm text-body-sm text-on-surface-variant">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const social = [
    { href: contact.facebookUrl, label: t("facebook") },
    { href: contact.instagramUrl, label: t("instagram") },
    { href: contact.whatsappUrl, label: t("whatsapp") },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href));

  return (
    <footer className="mt-space-xl bg-surface-container-low text-on-surface print:hidden">
      <div className="mx-auto max-w-shop px-margin-sm py-space-xl md:px-gutter">
        <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-space-md lg:col-span-2 lg:pr-space-lg">
            <Logo />
            <p className="max-w-sm text-body-md text-on-surface-variant">{t("about")}</p>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant">
              <li>
                <a
                  href={`tel:${contact.phoneTel}`}
                  className="inline-flex items-center gap-space-xs text-label-md text-primary hover:underline"
                >
                  <Phone className="size-4" aria-hidden />
                  {localizeDigits(contact.phoneDisplay, locale)}
                </a>
              </li>
              {contact.email ? (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-space-xs hover:text-primary"
                  >
                    <Mail className="size-4" aria-hidden />
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {contact.address ? (
                <li className="flex items-start gap-space-xs">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {localizeDigits(contact.address, locale)}
                </li>
              ) : null}
            </ul>
            {social.length ? (
              <ul className="flex flex-wrap gap-space-sm" aria-label={t("followUs")}>
                {social.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-surface-container px-space-sm py-1 text-label-sm text-primary hover:bg-surface-container-high"
                    >
                      <MessageCircle className="size-3.5" aria-hidden />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <LanguageSwitcher />
          </div>
          {column(
            t("shopTitle"),
            categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
          )}
          {column(
            t("supportTitle"),
            supportLinks.map(([href, key]) => ({ href, label: t(key) })),
          )}
          {column(
            t("policyTitle"),
            policyLinks.map(([href, key]) => ({ href, label: t(key) })),
          )}
        </div>

        <div className="mt-space-xl flex flex-col items-center justify-between gap-space-md border-t border-outline-variant/30 pt-space-lg text-body-sm text-on-surface-variant md:flex-row">
          <p className="flex items-center gap-space-sm text-center md:text-left">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
            {t("payments")}
          </p>
          <p>{t("copyright", { year: formatDigits(new Date().getFullYear(), locale) })}</p>
        </div>
      </div>
    </footer>
  );
}
