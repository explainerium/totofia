import { Heart, MapPin, Package, UserRound } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderRow } from "@/components/storefront/account/OrderRow";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listUserOrders } from "@/server/modules/account/account.service";
import { accountMetadata, requireAccountUser } from "../account-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">) {
  return accountMetadata((await params).locale as Locale, "/account", "metaTitle");
}

export default async function AccountOverviewPage({ params }: PageProps<"/[locale]/account">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const user = await requireAccountUser(locale, "/account");
  const t = await getTranslations("Account");
  const { items } = await listUserOrders(user.id, locale, { limit: 3 });

  const links = [
    { href: "/account/orders", label: t("orders"), icon: Package },
    { href: "/account/addresses", label: t("addresses"), icon: MapPin },
    { href: "/wishlist", label: t("wishlist"), icon: Heart },
    { href: "/account/profile", label: t("profile"), icon: UserRound },
  ];

  return (
    <div className="space-y-space-xl">
      <div className="rounded-2xl bg-surface-container-low p-space-lg">
        <h1 className="font-heading text-headline-md text-on-surface">
          {t("greeting", { name: user.name.split(" ")[0] ?? user.name })}
        </h1>
        <p className="text-body-md text-on-surface-variant">{t("greetingSub")}</p>
      </div>

      <section className="space-y-space-md">
        <div className="flex items-center justify-between gap-space-md">
          <h2 className="font-heading text-headline-sm">{t("recentOrders")}</h2>
          {items.length ? (
            <Link href="/account/orders" className="text-label-md text-primary hover:underline">
              {t("viewAllOrders")}
            </Link>
          ) : null}
        </div>
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
      </section>

      <section className="space-y-space-md">
        <h2 className="font-heading text-headline-sm">{t("quickLinks")}</h2>
        <ul className="grid grid-cols-2 gap-space-sm md:grid-cols-4">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col items-center gap-space-sm rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md text-center text-label-md transition-shadow hover:shadow-card-hover"
              >
                <Icon className="size-6 text-primary" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
