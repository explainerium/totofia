"use client";

import { TicketPercent, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/axios";
import { useApplyCouponMutation, useRemoveCouponMutation } from "@/redux/api/cartApi";
import { toastApiError } from "./api-error";

type Props = {
  /** Code saved on the cart, if any. */
  code: string | null;
  /** Why the saved code does not apply right now (Errors.* key from the preview). */
  problem?: string | null;
};

/** Apply / remove a coupon. The code itself (e.g. WELCOME10) is shown as typed. */
export function CouponForm({ code, problem }: Props) {
  const t = useTranslations("Cart");
  const tErrors = useTranslations("Errors");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [apply, { isLoading: applying }] = useApplyCouponMutation();
  const [remove, { isLoading: removing }] = useRemoveCouponMutation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setError(null);
    try {
      await apply(value.trim()).unwrap();
      toast.success(t("couponApplied", { code: value.trim().toUpperCase() }));
      setValue("");
    } catch (err) {
      setError(isApiError(err) && err.statusCode ? err.message : tErrors("internal"));
    }
  };

  if (code) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-space-sm rounded-xl border border-dashed border-primary/50 bg-secondary-fixed/20 px-space-sm py-2">
          <span className="flex items-center gap-space-xs text-label-md text-primary">
            <TicketPercent className="size-4" aria-hidden />
            {t("couponApplied", { code })}
          </span>
          <button
            type="button"
            onClick={() =>
              remove()
                .unwrap()
                .catch((e) => toastApiError(e, tErrors("internal")))
            }
            disabled={removing}
            aria-label={t("couponRemove")}
            title={t("couponRemove")}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <X className="size-4" />
          </button>
        </div>
        {problem ? (
          <p className="text-body-sm text-error">
            {tErrors.has(problem as never) ? tErrors(problem as never) : tErrors("validation")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-1" noValidate>
      <label htmlFor="coupon" className="text-label-md text-on-surface">
        {t("couponLabel")}
      </label>
      <div className="flex gap-space-sm">
        <input
          id="coupon"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("couponPlaceholder")}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          className="h-11 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-space-sm text-body-md uppercase placeholder:normal-case focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={applying || !value.trim()}
          className="h-11 rounded-lg border-[1.5px] border-primary px-space-md text-label-md text-primary hover:bg-secondary-fixed/30 disabled:opacity-50"
        >
          {t("couponApply")}
        </button>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
    </form>
  );
}
