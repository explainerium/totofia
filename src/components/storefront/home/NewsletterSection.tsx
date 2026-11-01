"use client";

import { CircleCheck, Lock, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { isApiError } from "@/lib/api/axios";
import { useSubscribeNewsletterMutation } from "@/redux/api/storefrontContentApi";
import { newsletterInput } from "@/server/modules/content/content.schema";

/** "Parenting club" sign-up (per design) → Admin → Newsletter. */
export function NewsletterSection() {
  const t = useTranslations("Newsletter");
  const tValidation = useTranslations("Validation");
  const tErrors = useTranslations("Errors");
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!newsletterInput.safeParse({ email }).success) {
      setError(tValidation("invalidEmail"));
      return;
    }
    setError(null);
    try {
      await subscribe({ email }).unwrap();
      setDone(true);
    } catch (err) {
      setError(isApiError(err) && err.statusCode ? err.message : tErrors("internal"));
    }
  };

  return (
    <section className="mx-auto max-w-shop px-margin-sm py-space-xl md:px-gutter">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-space-lg py-space-xl text-on-primary md:px-space-xl">
        <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-on-primary/5" />
        <div className="relative grid items-center gap-space-lg lg:grid-cols-12">
          <div className="space-y-space-sm lg:col-span-7">
            <span className="inline-flex items-center gap-space-xs rounded-full bg-on-primary/10 px-space-sm py-1 text-label-sm">
              <Mail className="size-4" aria-hidden />
              {t("eyebrow")}
            </span>
            <h2 className="font-heading text-headline-lg-mobile md:text-headline-lg">
              {t("title")}
            </h2>
            <p className="max-w-xl text-body-lg text-on-primary/85">{t("body")}</p>
          </div>
          <div className="lg:col-span-5">
            {done ? (
              <p
                role="status"
                className="flex items-center gap-space-sm rounded-2xl bg-on-primary/10 p-space-md text-label-lg"
              >
                <CircleCheck className="size-6 shrink-0" aria-hidden />
                {t("success")}
              </p>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-space-sm">
                <div className="flex gap-space-xs rounded-full bg-surface p-1.5">
                  <label htmlFor="newsletter-email" className="sr-only">
                    {t("emailLabel")}
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("placeholder")}
                    aria-invalid={Boolean(error)}
                    className="min-w-0 flex-1 rounded-full bg-transparent px-space-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="shrink-0 rounded-full bg-primary px-space-lg py-2.5 text-label-lg text-on-primary hover:bg-primary-container disabled:opacity-60"
                  >
                    {isLoading ? t("joining") : t("join")}
                  </button>
                </div>
                {error ? (
                  <p role="alert" className="px-space-md text-body-sm text-error-container">
                    {error}
                  </p>
                ) : null}
                <p className="flex items-center gap-space-xs px-space-md text-body-sm text-on-primary/75">
                  <Lock className="size-3.5" aria-hidden />
                  {t("privacy")}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
