"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/server/modules/catalog/catalog.service";

/** Horizontal, scrollable category bar (tablet and up). */
export function CategoryNav({ categories }: { categories: NavCategory[] }) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const links = [
    { href: "/shop", label: t("allProducts") },
    ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
  ];

  return (
    <div className="hidden border-t border-outline-variant/30 bg-surface-container-lowest md:block">
      <nav
        aria-label={t("mainNav")}
        className="mx-auto flex h-12 max-w-shop [scrollbar-width:none] items-center gap-space-lg overflow-x-auto px-gutter whitespace-nowrap"
      >
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-b-2 py-3 text-label-md transition-colors",
                active
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
