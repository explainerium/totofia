"use client";

import { Search, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format/intl";
import { cn } from "@/lib/utils";

type Suggestion = { name: string; slug: string; image: string | null; price: number | null };

/** Header search with debounced suggestions from /api/v1/search/suggest (in the page language). */
export function SearchBox({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const term = q.trim();
  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search/suggest?q=${encodeURIComponent(term)}`, {
          headers: { "x-locale": locale },
          signal: controller.signal,
        });
        const body = (await res.json()) as { success: boolean; data?: Suggestion[] };
        setItems(body.success ? (body.data ?? []) : []);
      } catch {
        // aborted or offline — keep the previous list
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, locale]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const showList = open && term.length >= 2 && items !== null;

  return (
    <div ref={box} className={cn("relative w-full", className)}>
      <form role="search" onSubmit={submit} className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-space-md size-5 text-outline"
          aria-hidden
        />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder={t("searchPlaceholder")}
          role="combobox"
          aria-autocomplete="list"
          aria-label={t("searchLabel")}
          aria-controls={listId}
          aria-expanded={showList}
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pr-10 pl-11 text-body-sm text-on-surface transition-all placeholder:text-outline focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setItems(null);
            }}
            aria-label={t("clearSearch")}
            className="absolute right-space-md text-outline hover:text-on-surface"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </form>

      {showList ? (
        <div
          id={listId}
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-overlay"
        >
          {items.length === 0 ? (
            <p className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
              {t("noSuggestions")}
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-space-sm px-space-md py-space-sm hover:bg-surface-container-low"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          unoptimized
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="flex-1 text-body-sm text-on-surface">{item.name}</span>
                    {item.price !== null ? (
                      <span className="text-label-md text-primary">
                        {formatPrice(item.price, locale)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={submit}
            className="w-full border-t border-outline-variant/40 px-space-md py-space-sm text-left text-label-md text-primary hover:bg-surface-container-low"
          >
            {t("viewAllResults")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
