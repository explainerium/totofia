import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only 0–5 stars (half-star precision is rounded to the nearest whole star). */
export function RatingStars({
  value,
  className,
  label,
}: {
  value: number;
  className?: string;
  /** Accessible text, e.g. "4.5 out of 5" in the page language. */
  label: string;
}) {
  const full = Math.round(value);
  return (
    <span role="img" aria-label={label} className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "size-4",
            i < full
              ? "fill-primary-container text-primary-container"
              : "fill-transparent text-outline-variant",
          )}
        />
      ))}
    </span>
  );
}
