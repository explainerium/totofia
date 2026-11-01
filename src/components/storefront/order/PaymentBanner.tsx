import { CircleAlert, CircleCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

type Props = {
  /** "paid": back from the gateway after paying; "failed"/"cancelled": payment not completed. */
  kind: "placed" | "paid" | "failed" | "cancelled";
  /** Pay-now button shown inside the failure banner. */
  action?: ReactNode;
};

/** Top-of-page message after checkout or after returning from the payment gateway. */
export async function PaymentBanner({ kind, action }: Props) {
  const t = await getTranslations("Order");
  const ok = kind === "placed" || kind === "paid";
  const Icon = ok ? CircleCheck : CircleAlert;
  const title =
    kind === "placed"
      ? t("placedTitle")
      : kind === "paid"
        ? t("paidTitle")
        : kind === "failed"
          ? t("paymentFailedTitle")
          : t("paymentCancelledTitle");
  const body = ok ? (kind === "paid" ? t("paidBody") : t("placedBody")) : t("paymentRetryBody");

  return (
    <div
      role={ok ? "status" : "alert"}
      className={`flex gap-space-md rounded-2xl p-space-md md:p-space-lg ${
        ok ? "bg-secondary-fixed/40" : "bg-error-container"
      }`}
    >
      <Icon className={`size-8 shrink-0 ${ok ? "text-primary" : "text-error"}`} aria-hidden />
      <div className="space-y-1">
        <h1 className="font-heading text-headline-sm md:text-headline-md">{title}</h1>
        <p className={`text-body-md ${ok ? "text-on-surface-variant" : "text-on-error-container"}`}>
          {body}
        </p>
        {ok ? <p className="text-body-sm text-on-surface-variant">{t("saveLink")}</p> : null}
        {action ? <div className="pt-space-sm">{action}</div> : null}
      </div>
    </div>
  );
}
