"use client";

import { House, LayoutGrid, ShoppingBag, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Fixed bottom bar on phones (DESIGN.md › Layout: Home, Categories, Cart, Account). */
export function MobileBottomNav({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("MobileNav");
  const pathname = usePathname();
  const items = [
    { href: "/", label: t("home"), icon: House, active: pathname === "/" },
    {
      href: "/shop",
      label: t("categories"),
      icon: LayoutGrid,
      active: pathname.startsWith("/shop") || pathname.startsWith("/category"),
    },
    { href: "/cart", label: t("cart"), icon: ShoppingBag, active: pathname === "/cart" },
    {
      href: signedIn ? "/account" : "/login",
      label: t("account"),
      icon: UserRound,
      active: pathname.startsWith("/account") || pathname === "/login" || pathname === "/register",
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/40 bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden print:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, active }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-0.5 text-label-sm",
                active ? "text-primary" : "text-on-surface-variant",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
