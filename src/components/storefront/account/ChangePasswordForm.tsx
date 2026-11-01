"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useAuthErrorMessage } from "../auth/auth-errors";
import { FormAlert } from "../auth/AuthCard";
import { PasswordInput } from "../auth/PasswordInput";
import { Field, useFieldError } from "../checkout/fields";

const schema = z
  .object({
    currentPassword: z.string().min(1, "required"),
    newPassword: z.string().min(8, "passwordTooShort").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });

type Values = z.input<typeof schema>;

export function ChangePasswordForm() {
  const t = useTranslations("Account");
  const fieldError = useFieldError();
  const authError = useAuthErrorMessage();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const errors = formState.errors;

  const onSubmit = async (values: Values) => {
    setError(null);
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      setError(authError(error));
      return;
    }
    reset();
    toast.success(t("passwordChanged"));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field
        id="currentPassword"
        label={t("currentPassword")}
        error={fieldError(errors.currentPassword)}
      >
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
      </Field>
      <div className="grid gap-space-md sm:grid-cols-2">
        <Field id="newPassword" label={t("newPassword")} error={fieldError(errors.newPassword)}>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register("newPassword")}
          />
        </Field>
        <Field
          id="confirmPassword"
          label={t("confirmPassword")}
          error={fieldError(errors.confirmPassword)}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </Field>
      </div>
      <Button type="submit" className="rounded-full" disabled={formState.isSubmitting}>
        {t("changePassword")}
      </Button>
    </form>
  );
}
