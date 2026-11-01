import { MessageSquareQuote } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { formatDate, formatNumber } from "@/lib/format/intl";
import type { ProductReviews as Reviews } from "@/server/modules/review/review.service";
import { RatingStars } from "./RatingStars";

/** Stars + count next to the product title; links to the reviews section. */
export async function ReviewSummary({ reviews }: { reviews: Reviews }) {
  if (!reviews.count) return null;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Reviews");
  const average = formatNumber(Math.round(reviews.average * 10) / 10, locale);
  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-space-sm text-label-md hover:underline"
    >
      <RatingStars value={reviews.average} label={t("outOf5", { value: average })} />
      <span className="text-on-surface">{average}</span>
      <span className="text-on-surface-variant">
        ({t("count", { count: reviews.count, n: formatNumber(reviews.count, locale) })})
      </span>
    </a>
  );
}

/** Approved reviews, shown as the customer wrote them. */
export async function ReviewsSection({ reviews }: { reviews: Reviews }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Reviews");
  const average = formatNumber(Math.round(reviews.average * 10) / 10, locale);

  return (
    <section id="reviews" className="mt-space-xl scroll-mt-40 space-y-space-md">
      <div className="flex flex-wrap items-end justify-between gap-space-sm">
        <h2 className="text-headline-md font-bold text-on-surface">{t("title")}</h2>
        {reviews.count ? (
          <p className="flex items-center gap-space-sm text-label-md text-on-surface-variant">
            <RatingStars value={reviews.average} label={t("outOf5", { value: average })} />
            {t("summary", {
              value: average,
              count: reviews.count,
              n: formatNumber(reviews.count, locale),
            })}
          </p>
        ) : null}
      </div>

      {reviews.count ? (
        <ul className="grid gap-space-md md:grid-cols-2">
          {reviews.items.map((r) => (
            <li
              key={r.id}
              className="space-y-space-sm rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md"
            >
              <div className="flex items-center justify-between gap-space-sm">
                <RatingStars
                  value={r.rating}
                  label={t("outOf5", { value: formatNumber(r.rating, locale) })}
                />
                <time className="text-body-sm text-on-surface-variant">
                  {formatDate(r.createdAt, locale, "medium")}
                </time>
              </div>
              {/* A review is shown in the language it was written in. */}
              <p lang={r.locale} className="text-body-md whitespace-pre-line text-on-surface">
                {r.body}
              </p>
              <p className="text-label-md text-on-surface-variant">
                {t("byVerified", { name: r.author })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-space-sm rounded-2xl border border-dashed border-outline-variant p-space-lg text-body-md text-on-surface-variant">
          <MessageSquareQuote className="size-5 shrink-0 text-primary" aria-hidden />
          {t("empty")}
        </div>
      )}
    </section>
  );
}
