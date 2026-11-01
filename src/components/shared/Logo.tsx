import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "./LogoMark";

/** Panda mark + wordmark in the current language only (টোটোফিয়া / totofia). */
export function Logo() {
  const t = useTranslations("Brand");

  return (
    <Link href="/" className="flex items-center gap-space-sm" aria-label={t("name")}>
      <LogoMark className="size-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[26px] leading-8 font-extrabold tracking-tight text-primary-container lowercase">
          {t("name")}
        </span>
        <span className="text-label-sm tracking-[0.12em] text-brand-accent uppercase">
          {t("tagline")}
        </span>
      </span>
    </Link>
  );
}
