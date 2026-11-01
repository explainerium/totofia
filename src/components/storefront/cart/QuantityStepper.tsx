"use client";

import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format/intl";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

/** − 1 + control with localized digits. Never goes below 1 (removing is a separate action). */
export function QuantityStepper({ value, max, onChange, disabled, size = "md" }: Props) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const button = cn(
    "flex items-center justify-center rounded-full disabled:opacity-40",
    size === "sm" ? "size-8" : "size-11",
  );

  return (
    <div className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container-lowest">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label={t("decrease")}
        className={button}
      >
        <Minus className="size-4" />
      </button>
      <output
        aria-label={t("quantity")}
        className={cn(
          "text-center",
          size === "sm" ? "min-w-6 text-label-md" : "min-w-8 text-label-lg",
        )}
      >
        {formatNumber(value, locale)}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label={t("increase")}
        className={button}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
