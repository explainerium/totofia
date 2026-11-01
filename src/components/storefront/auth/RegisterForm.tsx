"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { registerInput } from "@/server/modules/account/account.schema";
import { Field, TextInput, useFieldError } from "../checkout/fields";
import { useAuthErrorMessage } from "./auth-errors";
import { FormAlert } from "./AuthCard";
import { PasswordInput } from "./PasswordInput";
import { useAfterAuth } from "./useAfterAuth";

const schema = registerInput
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });

type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

export function RegisterForm({ next }: { next: string }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const fieldError = useFieldError();
  const authError = useAuthErrorMessage();
  const afterAuth = useAfterAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });
  const errors = formState.errors;

  const onSubmit = async (values: Output) => {
    setError(null);
    const { data, error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone || undefined,
      locale,
    });
    if (error || !data) {
      setError(authError(error));
      return;
    }
    toast.success(t("registeredToast"));
    afterAuth(next);
  };

  const aria = (name: keyof Values) => ({ "aria-invalid": Boolean(errors[name]) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field id="name" label={t("name")} error={fieldError(errors.name)}>
        <TextInput id="name" autoComplete="name" {...register("name")} {...aria("name")} />
      </Field>
      <Field id="email" label={t("email")} error={fieldError(errors.email)}>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          {...aria("email")}
        />
      </Field>
      <Field id="phone" label={t("phone")} error={fieldError(errors.phone)}>
        <TextInput
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("phonePlaceholder")}
          {...register("phone")}
          {...aria("phone")}
        />
      </Field>
      <Field id="password" label={t("password")} error={fieldError(errors.password)}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          {...register("password")}
          {...aria("password")}
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
          {...aria("confirmPassword")}
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? t("registering") : t("registerButton")}
      </Button>
    </form>
  );
}
