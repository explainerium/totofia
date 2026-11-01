import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format/intl";
import { cn } from "@/lib/utils";

type Props = {
  amount: number | null;
  compareAt?: number | null;
  locale: Locale;
  size?: "md" | "lg";
  className?: string;
};

/** Current price in brand colour, with the regular price struck through during a sale. */
export function Price({ amount, compareAt, locale, size = "md", className }: Props) {
  if (amount === null) return null;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-heading font-bold text-primary",
          size === "lg" ? "text-headline-md" : "text-headline-sm",
        )}
      >
        {formatPrice(amount, locale)}
      </span>
      {compareAt ? (
        <span className="text-body-sm text-outline line-through">
          {formatPrice(compareAt, locale)}
        </span>
      ) : null}
    </div>
  );
}
