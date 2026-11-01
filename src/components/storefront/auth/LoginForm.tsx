"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { loginInput } from "@/server/modules/account/account.schema";
import { Field, TextInput, useFieldError } from "../checkout/fields";
import { useAuthErrorMessage } from "./auth-errors";
import { FormAlert } from "./AuthCard";
import { PasswordInput } from "./PasswordInput";
import { useAfterAuth } from "./useAfterAuth";

type Values = z.input<typeof loginInput>;

export function LoginForm({ next }: { next: string }) {
  const t = useTranslations("Auth");
  const fieldError = useFieldError();
  const authError = useAuthErrorMessage();
  const afterAuth = useAfterAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(loginInput),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: Values) => {
    setError(null);
    const { data, error } = await authClient.signIn.email(values);
    if (error || !data) {
      setError(authError(error));
      return;
    }
    toast.success(t("welcomeToast", { name: data.user.name.split(" ")[0] }));
    afterAuth(next);
  };

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
      <Field id="password" label={t("password")} error={fieldError(formState.errors.password)}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={Boolean(formState.errors.password)}
          {...register("password")}
        />
      </Field>
      <div className="text-right">
        <Link href="/forgot-password" className="text-label-md text-primary hover:underline">
          {t("forgotLink")}
        </Link>
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? t("loggingIn") : t("loginButton")}
      </Button>
    </form>
  );
}
