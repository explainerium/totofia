"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Segmented বাংলা | EN pill (DESIGN.md › Language Switcher). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex items-center rounded-full bg-surface-container p-space-xs",
        className,
      )}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          disabled={isPending}
          onClick={() =>
            // Keep the query (search, filters, order page flags) — read at click time so the
            // header needs no useSearchParams (which would opt pages out of static rendering).
            startTransition(() =>
              router.replace(`${pathname}${window.location.search}`, { locale: l }),
            )
          }
          className={cn(
            "min-w-10 rounded-full px-space-sm py-0.5 text-label-sm transition-colors",
            l === locale
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
