import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="grid flex-1 place-items-center px-margin-sm py-space-xl text-center">
      <div className="max-w-md space-y-space-md">
        <h1 className="text-headline-lg-mobile md:text-headline-lg">{t("title")}</h1>
        <p className="text-on-surface-variant">{t("description")}</p>
        <Button asChild size="lg">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </main>
  );
}
