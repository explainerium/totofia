"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Field, TextInput, useFieldError } from "../checkout/fields";
import { useAuthErrorMessage } from "./auth-errors";
import { FormAlert } from "./AuthCard";

const schema = z.object({ email: z.email("invalidEmail") });
type Values = z.input<typeof schema>;

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const fieldError = useFieldError();
  const authError = useAuthErrorMessage();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: Values) => {
    setError(null);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: locale === "bn" ? "/reset-password" : `/${locale}/reset-password`,
    });
    // Same answer whether or not the email exists (no account enumeration); only rate limits show.
    if (error?.status === 429) {
      setError(authError(error));
      return;
    }
    setSent(true);
  };

  if (sent) return <FormAlert tone="success">{t("resetSent")}</FormAlert>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field id="email" label={t("email")} error={fieldError(formState.errors.email)}>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(formState.errors.email)}
          {...register("email")}
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? t("sending") : t("sendLink")}
      </Button>
    </form>
  );
}
