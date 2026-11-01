import { FileText, MapPin, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { OrderItems } from "@/components/storefront/order/OrderItems";
import { PayNowButton } from "@/components/storefront/order/PayNowButton";
import { PaymentBanner } from "@/components/storefront/order/PaymentBanner";
import { StatusTimeline } from "@/components/storefront/order/StatusTimeline";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDate, formatDigits, formatPrice, localizeDigits } from "@/lib/format/intl";
import { DIVISIONS, findDistrict, type DivisionCode } from "@/lib/geo/bd";
import { TrackEvent } from "@/lib/analytics/TrackEvent";
import { orderTokenCookie, readAccessToken } from "@/server/lib/guest-token";
import { getGuestOrder } from "@/server/modules/order/order.service";

type Props = PageProps<"/[locale]/order/[number]">;

async function load({ params, searchParams }: Props) {
  const { locale, number } = await params;
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1) notFound();
  const token = await readAccessToken((await searchParams).token, orderTokenCookie(n));
  if (!token) notFound();
  try {
    return {
      locale: locale as Locale,
      token,
      order: await getGuestOrder(n, token, locale as Locale),
    };
  } catch {
    notFound();
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const locale = (await props.params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Order" });
  const number = Number((await props.params).number);
  return {
    title: t("metaTitle", { number: formatDigits(Number.isFinite(number) ? number : 0, locale) }),
    robots: { index: false, follow: false },
  };
}

/** Guest order page (opened with the access token from checkout / email). */
export default async function OrderPage(props: Props) {
  const { locale, token, order } = await load(props);
  setRequestLocale(locale);
  const t = await getTranslations("Order");
  const query = await props.searchParams;
  const placed = query.placed === "1";
  // Only what the order itself says counts; the query just picks the banner.
  const paidOnline = query.paid === "1" && order.paymentStatus === "PAID";
  // Back from the gateway: paid=1, or payment=failed|cancelled (the order itself exists).
  const banner = paidOnline
    ? "paid"
    : query.payment === "failed" || query.payment === "cancelled"
      ? query.payment
      : placed
        ? "placed"
        : null;
  const payNow = order.canPayOnline ? (
    <PayNowButton
      number={order.number}
      token={token}
      label={t("payNow", { amount: formatPrice(order.grandTotal, locale) })}
    />
  ) : null;
  const a = order.address;
  const district = a ? findDistrict(a.district)?.name[locale] : undefined;
  const division = a ? DIVISIONS[a.division as DivisionCode]?.[locale] : undefined;

  // Analytics purchase: COD right after placing, online orders only once paid.
  const purchased =
    paidOnline || (placed && order.paymentMethod === "COD" && order.status !== "CANCELLED");

  return (
    <div className="mx-auto max-w-shop space-y-space-lg px-margin-sm py-space-lg md:px-gutter md:py-space-xl">
      {purchased ? (
        <TrackEvent
          event="purchase"
          order={{
            number: order.number,
            value: order.grandTotal,
            shipping: order.shippingFee,
            // Same product ids as the server-side Conversions API event.
            items: order.items.map((i) => ({
              id: i.productId ?? i.name,
              name: i.name,
              price: i.unitPrice,
              quantity: i.quantity,
            })),
          }}
        />
      ) : null}
      {banner ? (
        <PaymentBanner
          kind={banner}
          action={banner === "failed" || banner === "cancelled" ? payNow : undefined}
        />
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div>
          <p className="text-label-md text-on-surface-variant">{t("orderNumber")}</p>
          <p
            className={
              banner ? "font-heading text-headline-md" : "font-heading text-headline-lg-mobile"
            }
          >
            #{formatDigits(order.number, locale)}
          </p>
        </div>
        <p className="text-body-sm text-on-surface-variant">
          {t("placedOn")}: {formatDate(order.createdAt, locale)}
        </p>
      </div>

      <div className="grid gap-space-lg lg:grid-cols-12">
        <Card title={t("itemsTitle")} className="lg:col-span-7">
          <OrderItems {...order} />
        </Card>
        <div className="space-y-space-lg lg:col-span-5">
          <Card title={t("statusTitle")}>
            <StatusTimeline status={order.status} history={order.history} />
          </Card>
          {a ? (
            <Card
              title={t("deliveryTitle")}
              icon={<MapPin className="size-5 text-primary" aria-hidden />}
            >
              <address className="space-y-0.5 text-body-md text-on-surface not-italic">
                <p className="text-label-lg">{a.name}</p>
                <p>{localizeDigits(a.phone, locale)}</p>
                <p>{a.addressLine}</p>
                <p>{[a.area, district, division].filter(Boolean).join(", ")}</p>
              </address>
            </Card>
          ) : null}
          <Card
            title={t("paymentTitle")}
            icon={<Wallet className="size-5 text-primary" aria-hidden />}
          >
            <p className="text-body-md">{t(`payment${order.paymentMethod}`)}</p>
            <p className="text-body-sm text-on-surface-variant">
              {t("paymentStatusLabel")}:{" "}
              <span
                className={
                  order.paymentStatus === "PAID" ? "text-label-md text-primary" : "text-label-md"
                }
              >
                {t(`paymentStatus${order.paymentStatus}`)}
              </span>
            </p>
            {payNow && banner !== "failed" && banner !== "cancelled" ? (
              <div className="space-y-space-xs">
                <p className="text-body-sm text-on-surface-variant">{t("payNowHint")}</p>
                {payNow}
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-space-sm">
        <Link
          href="/shop"
          className="rounded-full bg-primary px-space-lg py-3 text-label-lg text-on-primary hover:bg-primary-container"
        >
          {t("continueShopping")}
        </Link>
        <Link
          href="/track-order"
          className="rounded-full border-[1.5px] border-primary px-space-lg py-3 text-label-lg text-primary hover:bg-secondary-fixed/30"
        >
          {t("trackOrder")}
        </Link>
        <Link
          href={`/order/${order.number}/invoice`}
          className="inline-flex items-center gap-space-xs rounded-full border-[1.5px] border-outline-variant px-space-lg py-3 text-label-lg text-on-surface hover:bg-surface-container-low"
        >
          <FileText className="size-4" aria-hidden />
          {t("invoice")}
        </Link>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg ${className ?? ""}`}
    >
      <h2 className="flex items-center gap-space-xs font-heading text-headline-sm">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
