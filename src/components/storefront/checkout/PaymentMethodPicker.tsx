"use client";

import { Banknote, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { OnlineMethod } from "@/server/modules/payment/gateway-settings.schema";

type Method = "COD" | OnlineMethod;

type Props = {
  field: UseFormRegisterReturn<"paymentMethod">;
  selected: Method;
  /** Gateways enabled in Admin → Settings → Payments (from the checkout preview). */
  onlineMethods: OnlineMethod[];
};

/** Cash on delivery or an online gateway (bKash, Nagad, Rocket, cards). */
export function PaymentMethodPicker({ field, selected, onlineMethods }: Props) {
  const t = useTranslations("Checkout");
  const options: {
    value: Method;
    icon: typeof Banknote;
    label: string;
    via?: string;
    hint: string;
  }[] = [
    { value: "COD", icon: Banknote, label: t("cod"), hint: t("codHint") },
    ...onlineMethods.map((method) => ({
      value: method,
      icon: CreditCard,
      label: t("payOnline"),
      via: t(`via${method}`),
      hint: t("payOnlineHint"),
    })),
  ];

  return (
    <div role="radiogroup" aria-label={t("paymentTitle")} className="space-y-space-sm">
      {options.map(({ value, icon: Icon, label, via, hint }) => {
        const active = selected === value;
        return (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer items-start gap-space-sm rounded-xl border-2 p-space-md transition-colors",
              active
                ? "border-primary bg-secondary-fixed/15"
                : "border-outline-variant/60 hover:border-outline",
            )}
          >
            <input type="radio" value={value} {...field} className="mt-1 accent-primary" />
            <span className="flex-1">
              <span className="flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon className="size-5 text-primary" aria-hidden />
                {label}
              </span>
              {via ? <span className="block text-label-md text-primary">{via}</span> : null}
              <span className="text-body-sm text-on-surface-variant">{hint}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
