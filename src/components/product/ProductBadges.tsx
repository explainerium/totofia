import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Badge = "NEW" | "ORGANIC" | "BESTSELLER";

const styles: Record<Badge, string> = {
  NEW: "bg-primary-fixed text-on-primary-fixed-variant",
  ORGANIC: "bg-secondary-fixed text-on-secondary-fixed-variant",
  BESTSELLER: "bg-tertiary-fixed text-on-tertiary-fixed",
};

export function ProductBadges({ badges, className }: { badges: Badge[]; className?: string }) {
  const t = useTranslations("Product");
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span key={b} className={cn("rounded-full px-2.5 py-0.5 text-label-sm", styles[b])}>
          {t(`badge${b}`)}
        </span>
      ))}
    </div>
  );
}
