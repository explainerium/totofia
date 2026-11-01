"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { isApiError } from "@/lib/api/axios";
import { useUpdateProfileMutation } from "@/redux/api/accountApi";
import { profileInput } from "@/server/modules/account/account.schema";
import { Field, SelectInput, TextInput, useFieldError } from "../checkout/fields";

type Values = z.input<typeof profileInput>;
type Output = z.output<typeof profileInput>;

type Props = { name: string; email: string; phone: string | null; locale: "bn" | "en" };

export function ProfileForm({ name, email, phone, locale }: Props) {
  const t = useTranslations("Account");
  const tErrors = useTranslations("Errors");
  const fieldError = useFieldError();
  const router = useRouter();
  const [save] = useUpdateProfileMutation();
  const { register, handleSubmit, setError, formState } = useForm<Values, unknown, Output>({
    resolver: zodResolver(profileInput),
    defaultValues: { name, phone: phone ?? "", locale },
  });

  const onSubmit = async (values: Output) => {
    try {
      await save(values).unwrap();
      toast.success(t("profileSaved"));
      router.refresh(); // header greeting uses the name
    } catch (e) {
      if (isApiError(e) && e.details?.length) {
        for (const d of e.details) setError(d.path as keyof Values, { message: d.message });
      } else toast.error(isApiError(e) && e.statusCode ? e.message : tErrors("internal"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
      <Field id="name" label={t("name")} error={fieldError(formState.errors.name)}>
        <TextInput id="name" autoComplete="name" {...register("name")} />
      </Field>
      <Field id="email" label={t("email")} hint={t("emailReadonly")}>
        <TextInput id="email" value={email} readOnly disabled className="bg-surface-container" />
      </Field>
      <div className="grid gap-space-md sm:grid-cols-2">
        <Field id="phone" label={t("phone")} error={fieldError(formState.errors.phone)}>
          <TextInput
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register("phone")}
          />
        </Field>
        <Field id="locale" label={t("preferredLanguage")}>
          <SelectInput id="locale" {...register("locale")}>
            <option value="bn">{t("langBn")}</option>
            <option value="en">{t("langEn")}</option>
          </SelectInput>
        </Field>
      </div>
      <Button type="submit" className="rounded-full" disabled={formState.isSubmitting}>
        {t("save")}
      </Button>
    </form>
  );
}
