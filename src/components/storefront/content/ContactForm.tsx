"use client";

import { CircleCheck, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { isApiError } from "@/lib/api/axios";
import {
  useSendContactMessageMutation,
  type ContactPayload,
} from "@/redux/api/storefrontContentApi";
import { contactInput } from "@/server/modules/content/content.schema";
import { Field, TextArea, TextInput, useFieldError } from "../checkout/fields";

type Errors = Partial<Record<"name" | "phone" | "email" | "subject" | "message" | "form", string>>;

/** Contact form → Admin → Messages. The hidden `website` field is a bot trap. */
export function ContactForm() {
  const t = useTranslations("Contact");
  const tErrors = useTranslations("Errors");
  const fieldError = useFieldError();
  const [send, { isLoading }] = useSendContactMessageMutation();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = contactInput.safeParse(data);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form") as keyof Errors;
        next[key] ??= fieldError({ message: issue.message, type: issue.code });
      }
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      await send(data as ContactPayload).unwrap();
      form.reset();
      setSent(true);
    } catch (err) {
      const next: Errors = {};
      if (isApiError(err)) {
        for (const d of err.details ?? []) next[d.path as keyof Errors] ??= fieldError(d);
      }
      next.form = isApiError(err) && err.statusCode ? err.message : tErrors("internal");
      setErrors(next);
    }
  };

  if (sent) {
    return (
      <div className="flex gap-space-md rounded-2xl bg-secondary-fixed/40 p-space-lg" role="status">
        <CircleCheck className="size-7 shrink-0 text-primary" aria-hidden />
        <div className="space-y-space-sm">
          <p className="font-heading text-headline-sm">{t("sentTitle")}</p>
          <p className="text-body-md text-on-surface-variant">{t("sentBody")}</p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-label-md text-primary hover:underline"
          >
            {t("sendAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-space-md">
      <div className="grid gap-space-md sm:grid-cols-2">
        <Field id="name" label={t("name")} error={errors.name}>
          <TextInput
            id="name"
            name="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field id="phone" label={t("phone")} error={errors.phone} hint={t("phoneOrEmail")}>
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
        <Field id="email" label={t("email")} error={errors.email}>
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
        <Field id="subject" label={t("subject")} error={errors.subject}>
          <TextInput id="subject" name="subject" aria-invalid={Boolean(errors.subject)} />
        </Field>
      </div>
      <Field id="message" label={t("message")} error={errors.message}>
        <TextArea
          id="message"
          name="message"
          rows={6}
          className="min-h-36"
          aria-invalid={Boolean(errors.message)}
        />
      </Field>
      {/* Bot trap: hidden from people and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      {errors.form ? (
        <p role="alert" className="text-body-sm text-error">
          {errors.form}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-12 items-center justify-center gap-space-xs rounded-full bg-primary px-space-lg text-label-lg text-on-primary hover:bg-primary-container disabled:opacity-60"
      >
        <Send className="size-4" aria-hidden />
        {isLoading ? t("sending") : t("send")}
      </button>
    </form>
  );
}
