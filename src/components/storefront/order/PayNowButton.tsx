"use client";

import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/axios";
import { usePayOrderMutation } from "@/redux/api/checkoutApi";

type Props = { number: number; token: string; label: string };

/** "Pay now" for an unpaid online order: new gateway session, then full navigation to it. */
export function PayNowButton({ number, token, label }: Props) {
  const t = useTranslations("Order");
  const tErrors = useTranslations("Errors");
  const [pay, { isLoading }] = usePayOrderMutation();
  const [redirecting, setRedirecting] = useState(false);

  const onClick = async () => {
    try {
      const { paymentUrl } = await pay({ number, token }).unwrap();
      setRedirecting(true);
      window.location.assign(paymentUrl);
    } catch (e) {
      // API messages come back in the page language (x-locale).
      toast.error(isApiError(e) && e.statusCode ? e.message : tErrors("internal"));
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || redirecting}
      className="inline-flex h-12 items-center justify-center gap-space-xs rounded-full bg-primary px-space-lg text-label-lg text-on-primary shadow-sm hover:bg-primary-container disabled:opacity-60"
    >
      <CreditCard className="size-5" aria-hidden />
      {redirecting ? t("redirecting") : isLoading ? t("paying") : label}
    </button>
  );
}
