"use client";

import { CircleCheck, ImageOff, Star } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { isApiError } from "@/lib/api/axios";
import { formatDigits, formatNumber } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import { useCreateReviewMutation, type ReviewableProduct } from "@/redux/api/reviewApi";
import { reviewInput } from "@/server/modules/content/content.schema";
import { TextArea, useFieldError } from "../checkout/fields";

/** One delivered product → star picker + text → review waiting for approval. */
export function ReviewComposer({ product }: { product: ReviewableProduct }) {
  const t = useTranslations("Reviews");
  const tErrors = useTranslations("Errors");
  const locale = useLocale();
  const router = useRouter();
  const fieldError = useFieldError();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [create, { isLoading }] = useCreateReviewMutation();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = String(new FormData(e.currentTarget).get("body") ?? "");
    if (rating < 1) {
      setError(t("pickRating"));
      return;
    }
    const parsed = reviewInput.safeParse({ productId: product.productId, rating, body });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(fieldError({ message: issue?.message, type: issue?.code }) ?? t("pickRating"));
      return;
    }
    setError(null);
    try {
      await create(parsed.data).unwrap();
      setSent(true);
      // The refresh drops this product from the list (and this card with it), so the
      // confirmation also goes to a toast that outlives it.
      toast.success(t("submitted"));
      router.refresh();
    } catch (err) {
      setError(isApiError(err) && err.statusCode ? err.message : tErrors("internal"));
    }
  };

  const shown = hover || rating;

  return (
    <li className="space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg">
      <div className="flex items-center gap-space-sm">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <ImageOff className="m-auto size-5 h-full text-outline" aria-hidden />
          )}
        </div>
        <div>
          <p className="text-label-lg text-on-surface">{product.name}</p>
          <p className="text-body-sm text-on-surface-variant">
            {t("fromOrder", { number: formatDigits(product.orderNumber, locale) })}
          </p>
        </div>
      </div>

      {sent ? (
        <p role="status" className="flex items-center gap-space-sm text-body-md text-primary">
          <CircleCheck className="size-5" aria-hidden />
          {t("submitted")}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-space-sm">
          <div
            role="radiogroup"
            aria-label={t("yourRating")}
            className="flex gap-1"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={t("outOf5", { value: formatNumber(n, locale) })}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
                className="rounded p-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <Star
                  aria-hidden
                  className={cn(
                    "size-7 transition-colors",
                    n <= shown
                      ? "fill-primary-container text-primary-container"
                      : "fill-transparent text-outline-variant",
                  )}
                />
              </button>
            ))}
          </div>
          <label htmlFor={`review-${product.productId}`} className="sr-only">
            {t("yourReview")}
          </label>
          <TextArea
            id={`review-${product.productId}`}
            name="body"
            rows={4}
            placeholder={t("placeholder")}
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <p role="alert" className="text-body-sm text-error">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <p className="text-body-sm text-on-surface-variant">{t("moderationNote")}</p>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-primary px-space-lg py-2.5 text-label-lg text-on-primary hover:bg-primary-container disabled:opacity-60"
            >
              {isLoading ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
