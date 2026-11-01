import { Check, CircleX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/format/intl";
import { cn } from "@/lib/utils";

type Status =
  "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

const FLOW: Status[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

type Props = { status: Status; history: { status: Status; at: Date | string }[] };

/** Order progress: the normal flow, or the flow up to the point it was cancelled / returned. */
export function StatusTimeline({ status, history }: Props) {
  const t = useTranslations("Order");
  const locale = useLocale();
  const when = (s: Status) => history.findLast((h) => h.status === s)?.at;
  const ended = status === "CANCELLED" || status === "RETURNED";
  const reached = ended
    ? FLOW.filter((s) => when(s))
    : FLOW.slice(0, Math.max(0, FLOW.indexOf(status)) + 1);
  const steps: Status[] = ended ? [...reached, status] : FLOW;

  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const done = ended || reached.includes(step);
        const at = when(step);
        const isEnd = ended && step === status;
        return (
          <li key={step} className="relative flex gap-space-sm pb-space-md last:pb-0">
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-7 left-3 h-[calc(100%-1.5rem)] w-0.5",
                  done ? "bg-primary" : "bg-outline-variant/60",
                )}
              />
            ) : null}
            <span
              className={cn(
                "z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                isEnd
                  ? "bg-error text-on-error"
                  : done
                    ? "bg-primary text-on-primary"
                    : "border-2 border-outline-variant bg-surface-container-lowest",
              )}
            >
              {isEnd ? (
                <CircleX className="size-4" aria-hidden />
              ) : done ? (
                <Check className="size-3.5" aria-hidden />
              ) : null}
            </span>
            <div className="-mt-0.5">
              <p
                className={cn(
                  "text-label-lg",
                  done ? "text-on-surface" : "text-on-surface-variant",
                )}
              >
                {t(`status${step}`)}
              </p>
              {at ? (
                <p className="text-body-sm text-on-surface-variant">
                  {formatDate(at, locale, "medium")}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
