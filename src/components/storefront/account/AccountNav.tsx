"use client";

import { Heart, LayoutDashboard, LogOut, MapPin, Package, Star, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, usePathname } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAfterAuth } from "../auth/useAfterAuth";

/** Sidebar on desktop, horizontally scrolling tabs on phones. */
export function AccountNav() {
  const t = useTranslations("Account");
  const tAuth = useTranslations("Auth");
  const pathname = usePathname();
  const afterAuth = useAfterAuth();

  const items = [
    { href: "/account", label: t("overview"), icon: LayoutDashboard, exact: true },
    { href: "/account/orders", label: t("orders"), icon: Package },
    { href: "/account/addresses", label: t("addresses"), icon: MapPin },
    { href: "/account/reviews", label: t("reviews"), icon: Star },
    { href: "/wishlist", label: t("wishlist"), icon: Heart },
    { href: "/account/profile", label: t("profile"), icon: UserRound },
  ];

  const signOut = async () => {
    await authClient.signOut();
    toast.success(tAuth("signedOutToast"));
    afterAuth("/");
  };

  const itemClass = (active: boolean) =>
    cn(
      "flex shrink-0 items-center gap-space-sm rounded-full px-space-md py-2 text-label-md transition-colors lg:rounded-lg",
      active
        ? "bg-primary text-on-primary"
        : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
    );

  return (
    <nav
      aria-label={t("navLabel")}
      className="-mx-margin-sm overflow-x-auto px-margin-sm lg:mx-0 lg:px-0"
    >
      <ul className="flex gap-space-xs lg:flex-col">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={signOut} className={itemClass(false)}>
            <LogOut className="size-4" aria-hidden />
            {t("signOut")}
          </button>
        </li>
      </ul>
    </nav>
  );
}
