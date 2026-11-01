"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

const KNOWN = [
  "required",
  "invalidPhone",
  "invalidEmail",
  "addressTooShort",
  "passwordTooShort",
  "passwordMismatch",
  "messageTooShort",
  "emailOrPhone",
  "reviewTooShort",
] as const;

/** zod / API messages are keys ("invalidPhone") — turn them into Validation.* text. */
export function useFieldError() {
  const t = useTranslations("Validation");
  return (error?: FieldError | { message?: string; type?: string }) => {
    if (!error) return undefined;
    const key = error.message ?? "";
    if ((KNOWN as readonly string[]).includes(key)) return t(key as (typeof KNOWN)[number]);
    if (error.type === "too_big") return t("tooLong");
    if (error.type === "too_small" || error.type === "invalid_type") return t("required");
    // Server-side messages (set without a type) are already localized sentences; any other
    // client-side message is zod's English default ("Invalid input").
    return key && !error.type ? key : t("invalid");
  };
}

type ShellProps = { id: string; label: string; error?: string; hint?: string; children: ReactNode };

export function Field({ id, label, error, hint, children }: ShellProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-label-md text-on-surface">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-body-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

const control =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-space-sm text-body-md text-on-surface placeholder:text-outline focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none aria-invalid:border-error";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-20 py-space-sm", className)} {...props} />;
}

export function SelectInput({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "h-12 appearance-auto", className)} {...props} />;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md md:p-space-lg">
      <h2 className="font-heading text-headline-sm text-on-surface">{title}</h2>
      {children}
    </section>
  );
}
