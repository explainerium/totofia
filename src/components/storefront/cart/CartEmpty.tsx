import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CartEmpty({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("Cart");
  return (
    <div className="flex flex-col items-center gap-space-md py-space-xl text-center">
      <span className="grid size-16 place-items-center rounded-full bg-surface-container text-primary">
        <ShoppingBag className="size-7" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="font-heading text-headline-sm text-on-surface">{t("empty")}</p>
        <p className="text-body-md text-on-surface-variant">{t("emptyBody")}</p>
      </div>
      <Link
        href="/shop"
        onClick={onNavigate}
        className="rounded-full bg-primary px-space-lg py-3 text-label-lg text-on-primary hover:bg-primary-container"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
