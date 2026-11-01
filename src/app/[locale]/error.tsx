"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/** Unexpected errors inside a storefront page — the header/footer layout stays in place. */
export default function StorefrontError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the page (`reset` would only re-render the failed result). */
  retry: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid flex-1 place-items-center px-margin-sm py-space-xl text-center">
      <div className="max-w-md space-y-space-md">
        <h1 className="text-headline-lg-mobile md:text-headline-lg">{t("title")}</h1>
        <p className="text-on-surface-variant">{t("description")}</p>
        <div className="flex flex-wrap justify-center gap-space-sm">
          <Button size="lg" onClick={() => retry()}>
            {t("retry")}
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">{t("backHome")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
