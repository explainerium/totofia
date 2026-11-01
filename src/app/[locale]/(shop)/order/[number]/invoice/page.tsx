import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/shared/Logo";
import { getContactInfo } from "@/components/shared/store-info";
import { PrintButton } from "@/components/storefront/order/PrintButton";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDate, formatDigits, formatPrice, localizeDigits } from "@/lib/format/intl";
import { DIVISIONS, findDistrict, type DivisionCode } from "@/lib/geo/bd";
import { orderTokenCookie, readAccessToken } from "@/server/lib/guest-token";
import { getGuestOrder } from "@/server/modules/order/order.service";

type Props = PageProps<"/[locale]/order/[number]/invoice">;

async function load({ params, searchParams }: Props) {
  const { locale, number } = await params;
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1) notFound();
  const token = await readAccessToken((await searchParams).token, orderTokenCookie(n));
  if (!token) notFound();
  try {
    return {
      locale: locale as Locale,
      order: await getGuestOrder(n, token, locale as Locale),
    };
  } catch {
    notFound();
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, number } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Invoice" });
  const n = Number(number);
  return {
    title: t("metaTitle", { number: formatDigits(Number.isFinite(n) ? n : 0, locale as Locale) }),
    robots: { index: false, follow: false },
  };
}

/** Printable invoice (A4) in the page language, opened with the order's access token. */
export default async function InvoicePage(props: Props) {
  const { locale, order } = await load(props);
  setRequestLocale(locale);
  const [t, tOrder, tCheckout, contact] = await Promise.all([
    getTranslations("Invoice"),
    getTranslations("Order"),
    getTranslations("Checkout"),
    getContactInfo(locale),
  ]);
  const price = (v: number) => formatPrice(v, locale);
  const a = order.address;
  const district = a ? findDistrict(a.district)?.name[locale] : undefined;
  const division = a ? DIVISIONS[a.division as DivisionCode]?.[locale] : undefined;

  return (
    <div className="mx-auto max-w-[210mm] px-margin-sm py-space-lg md:px-gutter print:max-w-none print:p-0">
      <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm print:hidden">
        <Link
          href={`/order/${order.number}`}
          className="text-label-md text-primary hover:underline"
        >
          {t("backToOrder")}
        </Link>
        <PrintButton label={t("print")} />
      </div>

      <article className="space-y-space-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-lg md:p-space-xl print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-space-md border-b border-outline-variant/50 pb-space-md">
          <div className="space-y-space-xs">
            <Logo />
            <p className="text-body-sm text-on-surface-variant">
              {localizeDigits(contact.phoneDisplay, locale)}
              {contact.email ? ` · ${contact.email}` : ""}
            </p>
            {contact.address ? (
              <p className="text-body-sm text-on-surface-variant">
                {localizeDigits(contact.address, locale)}
              </p>
            ) : null}
          </div>
          <div className="text-right">
            <h1 className="font-heading text-headline-md text-on-surface">{t("title")}</h1>
            <p className="text-label-md">#{formatDigits(order.number, locale)}</p>
            <p className="text-body-sm text-on-surface-variant">
              {tOrder("placedOn")}: {formatDate(order.createdAt, locale)}
            </p>
          </div>
        </header>

        <div className="grid gap-space-md sm:grid-cols-2">
          <div>
            <h2 className="mb-1 text-label-md text-on-surface-variant">{t("billTo")}</h2>
            <p className="text-label-lg">{order.customerName}</p>
            <p className="text-body-sm">{localizeDigits(order.customerPhone, locale)}</p>
            {order.customerEmail ? <p className="text-body-sm">{order.customerEmail}</p> : null}
          </div>
          {a ? (
            <div>
              <h2 className="mb-1 text-label-md text-on-surface-variant">
                {tOrder("deliveryTitle")}
              </h2>
              <p className="text-body-sm">{a.addressLine}</p>
              <p className="text-body-sm">
                {[a.area, district, division].filter(Boolean).join(", ")}
              </p>
            </div>
          ) : null}
        </div>

        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-container text-left text-label-md">
              <th className="px-space-sm py-2">{t("item")}</th>
              <th className="px-space-sm py-2 text-right">{t("qty")}</th>
              <th className="px-space-sm py-2 text-right">{t("unitPrice")}</th>
              <th className="px-space-sm py-2 text-right">{t("amount")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={`${item.name}-${i}`} className="border-b border-outline-variant/40">
                <td className="px-space-sm py-2">
                  <p className="text-label-md">{item.name}</p>
                  {item.variantLabel ? (
                    <p className="text-on-surface-variant">{item.variantLabel}</p>
                  ) : null}
                </td>
                <td className="px-space-sm py-2 text-right">
                  {formatDigits(item.quantity, locale)}
                </td>
                <td className="px-space-sm py-2 text-right">{price(item.unitPrice)}</td>
                <td className="px-space-sm py-2 text-right">{price(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto w-full max-w-xs space-y-1 text-body-md">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">{tCheckout("subtotal")}</dt>
            <dd>{price(order.subtotal)}</dd>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">
                {tCheckout("discount", { code: order.couponCode ?? "" })}
              </dt>
              <dd>−{price(order.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">{tCheckout("delivery")}</dt>
            <dd>{order.shippingFee === 0 ? tCheckout("free") : price(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-outline-variant/50 pt-1 text-label-lg">
            <dt>{tCheckout("total")}</dt>
            <dd>{price(order.grandTotal)}</dd>
          </div>
        </dl>

        <footer className="space-y-1 border-t border-outline-variant/50 pt-space-md text-body-sm text-on-surface-variant">
          <p>
            {tOrder("paymentTitle")}: {tOrder(`payment${order.paymentMethod}`)} ·{" "}
            {t(`payment${order.paymentStatus}`)}
          </p>
          <p>{t("thanks")}</p>
        </footer>
      </article>
    </div>
  );
}
