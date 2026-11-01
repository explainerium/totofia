"use client";

import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { isApiError } from "@/lib/api/axios";
import { formatDigits } from "@/lib/format/intl";
import { normalizeBdPhone } from "@/lib/format/phone";
import { useTrackOrderMutation, type TrackedOrder } from "@/redux/api/checkoutApi";
import { Field, TextInput } from "../checkout/fields";
import { OrderItems } from "./OrderItems";
import { StatusTimeline } from "./StatusTimeline";

const toLatin = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

/** Order number + phone → status. POST keeps the phone out of URLs. */
export function TrackOrderForm() {
  const t = useTranslations("Track");
  const tOrder = useTranslations("Order");
  const tValidation = useTranslations("Validation");
  const tErrors = useTranslations("Errors");
  const locale = useLocale();
  const [track, { isLoading }] = useTrackOrderMutation();
  const [errors, setErrors] = useState<{ number?: string; phone?: string; form?: string }>({});
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const number = Number(toLatin(String(data.get("number") ?? "")).replace(/\D/g, ""));
    const phone = normalizeBdPhone(String(data.get("phone") ?? ""));
    const next = {
      number: number > 0 ? undefined : t("invalidNumber"),
      phone: phone ? undefined : tValidation("invalidPhone"),
    };
    setErrors(next);
    setOrder(null);
    if (next.number || next.phone || !phone) return;
    try {
      setOrder(await track({ number, phone }).unwrap());
    } catch (err) {
      setErrors({ form: isApiError(err) && err.statusCode ? err.message : tErrors("internal") });
    }
  };

  return (
    <div className="space-y-space-lg">
      <form
        onSubmit={submit}
        noValidate
        className="grid gap-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md sm:grid-cols-[1fr_1fr_auto] sm:items-start md:p-space-lg"
      >
        <Field id="number" label={t("orderNumber")} error={errors.number}>
          <TextInput
            id="number"
            name="number"
            inputMode="numeric"
            placeholder={t("orderNumberPlaceholder")}
            aria-invalid={Boolean(errors.number)}
          />
        </Field>
        <Field id="phone" label={t("phone")} error={errors.phone}>
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-12 items-center justify-center gap-space-xs rounded-full bg-primary px-space-lg text-label-lg text-on-primary hover:bg-primary-container disabled:opacity-60 sm:mt-[26px]"
        >
          <Search className="size-4" aria-hidden />
          {isLoading ? t("searching") : t("submit")}
        </button>
        {errors.form ? (
          <p role="alert" className="text-body-sm text-error sm:col-span-3">
            {errors.form}
          </p>
        ) : null}
      </form>

      {order ? (
        <div className="grid gap-space-lg lg:grid-cols-12" aria-live="polite">
          <section className="space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg lg:col-span-5">
            <h2 className="font-heading text-headline-sm">
              {t("resultTitle", { number: formatDigits(order.number, locale) })}
            </h2>
            <StatusTimeline status={order.status} history={order.history} />
          </section>
          <section className="space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg lg:col-span-7">
            <h2 className="font-heading text-headline-sm">{tOrder("itemsTitle")}</h2>
            <OrderItems {...order} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
