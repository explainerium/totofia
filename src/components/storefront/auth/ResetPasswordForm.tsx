"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { Field, useFieldError } from "../checkout/fields";
import { useAuthErrorMessage } from "./auth-errors";
import { FormAlert } from "./AuthCard";
import { PasswordInput } from "./PasswordInput";

const schema = z
  .object({
    password: z.string().min(8, "passwordTooShort").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });

type Values = z.input<typeof schema>;

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations("Auth");
  const fieldError = useFieldError();
  const authError = useAuthErrorMessage();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : t("resetMissingToken"));
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (done) {
    return (
      <div className="space-y-space-md">
        <FormAlert tone="success">{t("resetDone")}</FormAlert>
        <Button asChild size="lg" className="h-12 w-full rounded-full">
          <Link href="/login">{t("loginLink")}</Link>
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-space-md">
        <FormAlert>{error}</FormAlert>
        <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-full">
          <Link href="/forgot-password">{t("requestNewLink")}</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async ({ password }: Values) => {
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      setError(authError(error));
      return;
    }
    setDone(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field id="password" label={t("newPassword")} error={fieldError(formState.errors.password)}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={Boolean(formState.errors.password)}
          {...register("password")}
        />
      </Field>
      <Field
        id="confirmPassword"
        label={t("confirmPassword")}
        error={fieldError(formState.errors.confirmPassword)}
      >
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(formState.errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? t("saving") : t("saveNewPassword")}
      </Button>
    </form>
  );
}
