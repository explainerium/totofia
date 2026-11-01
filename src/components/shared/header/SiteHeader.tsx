import { Headset, Truck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { CartButton } from "@/components/storefront/cart/CartButton";
import { WishlistLink } from "@/components/storefront/wishlist/WishlistLink";
import { localizeDigits } from "@/lib/format/intl";
import type { Locale } from "@/i18n/routing";
import { getCategoryTree } from "@/server/modules/catalog/catalog.service";
import { Logo } from "../Logo";
import { getContactInfo } from "../store-info";
import { AccountMenu } from "./AccountMenu";
import { CategoryNav } from "./CategoryNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";

/** Sticky storefront header: info bar, logo + search + actions, category navigation. */
export async function SiteHeader({ user }: { user: { firstName: string } | null }) {
  const locale = await getLocale();
  const t = await getTranslations("Header");
  const [categories, contact] = await Promise.all([
    getCategoryTree(locale),
    getContactInfo(locale as Locale),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 shadow-nav backdrop-blur-md print:hidden">
      <div className="bg-surface-container-low text-body-sm text-on-surface-variant">
        <div className="mx-auto flex h-10 max-w-shop items-center justify-between gap-space-md px-margin-sm md:px-gutter">
          <p className="flex min-w-0 items-center gap-space-xs text-label-md text-primary">
            <Truck className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{t("freeDelivery")}</span>
          </p>
          <div className="flex shrink-0 items-center gap-space-lg">
            <a
              href={`tel:${contact.phoneTel}`}
              className="hidden items-center gap-space-xs text-label-md hover:text-primary md:flex"
            >
              <Headset className="size-4" aria-hidden />
              <span>
                {t("helpline")}: {localizeDigits(contact.phoneDisplay, locale)}
              </span>
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-shop items-center gap-space-md px-margin-sm md:h-20 md:gap-space-lg md:px-gutter">
        <MobileMenu categories={categories} />
        <Logo />
        <SearchBox className="hidden max-w-2xl flex-1 md:block" />
        <div className="ml-auto flex items-center gap-space-xs md:gap-space-sm">
          <AccountMenu user={user} />
          <WishlistLink />
          <CartButton />
        </div>
      </div>

      <div className="px-margin-sm pb-space-sm md:hidden">
        <SearchBox />
      </div>

      <CategoryNav categories={categories} />
    </header>
  );
}
