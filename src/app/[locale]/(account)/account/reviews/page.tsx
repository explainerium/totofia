import { Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReviewComposer } from "@/components/storefront/account/ReviewComposer";
import type { Locale } from "@/i18n/routing";
import { reviewableProducts } from "@/server/modules/review/review.service";
import { accountMetadata, requireAccountUser } from "../../account-page";

type Props = PageProps<"/[locale]/account/reviews">;

export async function generateMetadata({ params }: Props) {
  return accountMetadata((await params).locale as Locale, "/account/reviews", "reviewsTitle");
}

/** Delivered products the customer has not reviewed yet. */
export default async function AccountReviewsPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const user = await requireAccountUser(locale, "/account/reviews");
  const [t, products] = await Promise.all([
    getTranslations("Reviews"),
    reviewableProducts(user.id, locale),
  ]);

  return (
    <div className="space-y-space-lg">
      <div>
        <h1 className="font-heading text-headline-md text-on-surface">{t("accountTitle")}</h1>
        <p className="text-body-md text-on-surface-variant">{t("accountSub")}</p>
      </div>
      {products.length ? (
        <ul className="space-y-space-md">
          {products.map((p) => (
            <ReviewComposer key={p.productId} product={p} />
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-space-sm rounded-2xl border border-dashed border-outline-variant p-space-lg text-body-md text-on-surface-variant">
          <Star className="size-5 shrink-0 text-primary" aria-hidden />
          {t("nothingToReview")}
        </div>
      )}
    </div>
  );
}
