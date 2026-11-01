"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isApiError } from "@/lib/api/axios";
import { DIVISION_CODES, DIVISIONS, districtsOf } from "@/lib/geo/bd";
import { useCreateAddressMutation, useUpdateAddressMutation } from "@/redux/api/accountApi";
import { addressInput } from "@/server/modules/account/account.schema";
import type { SavedAddress } from "@/server/modules/account/account.service";
import { Field, SelectInput, TextArea, TextInput, useFieldError } from "../checkout/fields";

type Values = z.input<typeof addressInput>;
type Output = z.output<typeof addressInput>;

type Props = { open: boolean; onOpenChange: (open: boolean) => void; address?: SavedAddress };

/** Add / edit a saved address (division → district → area → address line). */
export function AddressDialog({ open, onOpenChange, address }: Props) {
  const t = useTranslations("Account");
  const tCheckout = useTranslations("Checkout");
  const tErrors = useTranslations("Errors");
  const locale = useLocale();
  const fieldError = useFieldError();
  const [create] = useCreateAddressMutation();
  const [update] = useUpdateAddressMutation();

  const { register, handleSubmit, control, setValue, setError, formState } = useForm<
    Values,
    unknown,
    Output
  >({
    resolver: zodResolver(addressInput),
    values: {
      name: address?.name ?? "",
      phone: address?.phone ?? "",
      division: address?.division ?? "",
      district: address?.district ?? "",
      area: address?.area ?? "",
      addressLine: address?.addressLine ?? "",
      isDefault: address?.isDefault ?? false,
    },
  });
  const division = useWatch({ control, name: "division" });
  const errors = formState.errors;
  const err = (name: keyof Values) => fieldError(errors[name]);

  const onSubmit = async (values: Output) => {
    try {
      if (address) await update({ id: address.id, data: values }).unwrap();
      else await create(values).unwrap();
      toast.success(t("addressSaved"));
      onOpenChange(false);
    } catch (e) {
      if (isApiError(e) && e.details?.length) {
        for (const d of e.details) setError(d.path as keyof Values, { message: d.message });
      } else toast.error(isApiError(e) && e.statusCode ? e.message : tErrors("internal"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-headline-sm">
            {address ? t("editAddress") : t("addAddress")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
          <div className="grid gap-space-md sm:grid-cols-2">
            <Field id="addr-name" label={t("recipientName")} error={err("name")}>
              <TextInput id="addr-name" autoComplete="name" {...register("name")} />
            </Field>
            <Field id="addr-phone" label={t("phone")} error={err("phone")}>
              <TextInput id="addr-phone" type="tel" inputMode="tel" {...register("phone")} />
            </Field>
            <Field id="addr-division" label={tCheckout("division")} error={err("division")}>
              <SelectInput
                id="addr-division"
                {...register("division", { onChange: () => setValue("district", "") })}
              >
                <option value="">{tCheckout("choose")}</option>
                {DIVISION_CODES.map((code) => (
                  <option key={code} value={code}>
                    {DIVISIONS[code][locale]}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field id="addr-district" label={tCheckout("district")} error={err("district")}>
              <SelectInput id="addr-district" disabled={!division} {...register("district")}>
                <option value="">{tCheckout("choose")}</option>
                {districtsOf(division)
                  .slice()
                  .sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale))
                  .map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name[locale]}
                    </option>
                  ))}
              </SelectInput>
            </Field>
          </div>
          <Field id="addr-area" label={tCheckout("area")} error={err("area")}>
            <TextInput
              id="addr-area"
              placeholder={tCheckout("areaPlaceholder")}
              {...register("area")}
            />
          </Field>
          <Field id="addr-line" label={tCheckout("addressLine")} error={err("addressLine")}>
            <TextArea
              id="addr-line"
              placeholder={tCheckout("addressLinePlaceholder")}
              {...register("addressLine")}
            />
          </Field>
          <label className="flex items-center gap-space-sm text-body-md">
            <input type="checkbox" className="size-4 accent-primary" {...register("isDefault")} />
            {t("setAsDefault")}
          </label>
          <DialogFooter className="gap-space-sm">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" className="rounded-full" disabled={formState.isSubmitting}>
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
