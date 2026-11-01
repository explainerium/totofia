import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderRow } from "@/components/storefront/account/OrderRow";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDigits } from "@/lib/format/intl";
import { listUserOrders } from "@/server/modules/account/account.service";
import { accountMetadata, requireAccountUser } from "../../account-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/orders">) {
  return accountMetadata((await params).locale as Locale, "/account/orders", "ordersTitle");
}

export default async function AccountOrdersPage({
  params,
  searchParams,
}: PageProps<"/[locale]/account/orders">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const user = await requireAccountUser(locale, "/account/orders");
  const t = await getTranslations("Account");
  const tListing = await getTranslations("Listing");
  const pageParam = Number((await searchParams).page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const { items, meta } = await listUserOrders(user.id, locale, { page });

  return (
    <div className="space-y-space-lg">
      <h1 className="font-heading text-headline-md">{t("ordersTitle")}</h1>
      {items.length ? (
        <ul className="space-y-space-sm">
          {items.map((order) => (
            <OrderRow key={order.number} order={order} />
          ))}
        </ul>
      ) : (
        <div className="space-y-space-md rounded-2xl border border-dashed border-outline-variant p-space-lg text-center">
          <p className="text-body-md text-on-surface-variant">{t("noOrders")}</p>
          <Button asChild className="rounded-full">
            <Link href="/shop">{t("startShopping")}</Link>
          </Button>
        </div>
      )}

      {meta.totalPages > 1 ? (
        <nav
          aria-label={tListing("pagination")}
          className="flex items-center justify-center gap-space-md text-label-md"
        >
          {page > 1 ? (
            <Link
              href={{ pathname: "/account/orders", query: { page: page - 1 } }}
              aria-label={tListing("previous")}
              className="flex size-10 items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container-low"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : null}
          <span>
            {formatDigits(page, locale)} / {formatDigits(meta.totalPages, locale)}
          </span>
          {page < meta.totalPages ? (
            <Link
              href={{ pathname: "/account/orders", query: { page: page + 1 } }}
              aria-label={tListing("next")}
              className="flex size-10 items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container-low"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
