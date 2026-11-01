import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDate, formatDigits, formatPrice } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import type { UserOrderListItem } from "@/server/modules/account/account.service";

const statusTone: Record<UserOrderListItem["status"], string> = {
  PENDING: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  CONFIRMED: "bg-secondary-fixed/40 text-on-secondary-fixed-variant",
  PROCESSING: "bg-secondary-fixed/40 text-on-secondary-fixed-variant",
  SHIPPED: "bg-secondary-fixed/40 text-on-secondary-fixed-variant",
  DELIVERED: "bg-primary text-on-primary",
  CANCELLED: "bg-error-container text-on-error-container",
  RETURNED: "bg-error-container text-on-error-container",
};

/** One order in the account lists; opens the order page (token link). */
export function OrderRow({ order }: { order: UserOrderListItem }) {
  const t = useTranslations("Account");
  const tOrder = useTranslations("Order");
  const locale = useLocale();

  return (
    <li>
      <Link
        href={`/order/${order.number}?token=${encodeURIComponent(order.guestAccessToken)}`}
        className="flex items-center gap-space-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md transition-shadow hover:shadow-card-hover"
      >
        <div className="flex shrink-0 -space-x-3">
          {order.images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- small order thumbnails
            <img
              key={i}
              src={src}
              alt=""
              className="size-12 rounded-lg border-2 border-surface-container-lowest object-cover"
            />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-space-sm">
            <span className="text-label-lg text-on-surface">
              {t("orderNumber", { number: formatDigits(order.number, locale) })}
            </span>
            <span
              className={cn("rounded-full px-2 py-0.5 text-label-sm", statusTone[order.status])}
            >
              {tOrder(`status${order.status}`)}
            </span>
          </div>
          <p className="truncate text-body-sm text-on-surface-variant">
            {order.previewNames.join(", ")}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {formatDate(order.createdAt, locale)} · {t("itemCount", { count: order.itemCount })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-space-xs">
          <span className="text-label-lg text-on-surface">
            {formatPrice(order.grandTotal, locale)}
          </span>
          <ChevronRight className="size-4 text-outline" aria-hidden />
        </div>
      </Link>
    </li>
  );
}
