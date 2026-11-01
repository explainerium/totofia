"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import type { NavCategory } from "@/server/modules/catalog/catalog.service";

/** Slide-in category menu for small screens. */
export function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = [
    { href: "/shop", label: t("allProducts") },
    ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("menu")}
        className="-ml-2 flex size-10 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low md:hidden"
      >
        <Menu className="size-6" />
      </SheetTrigger>
      {/* Own close button: the default one carries an English screen-reader label. */}
      <SheetContent
        side="left"
        showCloseButton={false}
        aria-describedby={undefined}
        className="gap-0 bg-surface p-0"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 p-space-md">
          <SheetTitle className="font-heading text-headline-sm text-on-surface">
            {t("categories")}
          </SheetTitle>
          <button
            type="button"
            onClick={close}
            aria-label={t("closeMenu")}
            className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label={t("mainNav")} className="flex-1 overflow-y-auto p-space-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="flex items-center justify-between rounded-lg px-space-sm py-3 text-label-lg text-on-surface hover:bg-surface-container-low"
            >
              {link.label}
              <ChevronRight className="size-4 text-outline" aria-hidden />
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
