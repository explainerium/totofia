import { ArrowRight, BadgeCheck, Baby, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LiveBanner } from "@/server/modules/content/banner.service";
import heroImage from "../../../../public/images/hero-mother-baby.jpg";

/** Default copy and photo from the design; a live HOME_HERO banner (Admin → Banners) replaces them. */
export function HomeHero({ banner }: { banner?: LiveBanner | null }) {
  const t = useTranslations("Home");
  const trust = [
    { icon: Leaf, label: t("trustOrganic") },
    { icon: ShieldCheck, label: t("trustSafe") },
    { icon: Truck, label: t("trustDelivery") },
  ];

  return (
    <section className="relative overflow-hidden bg-surface-container-low">
      <div className="mx-auto grid max-w-shop grid-cols-1 items-center gap-space-lg px-margin-sm py-space-xl md:px-gutter lg:grid-cols-12 lg:py-16">
        <div className="z-10 flex flex-col items-start space-y-space-md lg:col-span-7">
          <span className="inline-flex items-center gap-space-xs rounded-full bg-surface-container px-space-sm py-1 text-label-sm text-primary">
            <BadgeCheck className="size-4" aria-hidden />
            {t("heroBadge")}
          </span>
          <h1 className="text-display-lg-mobile tracking-tight text-on-surface md:text-display-lg">
            {banner ? (
              banner.title
            ) : (
              <>
                {t("heroTitle")} <span className="text-primary">{t("heroHighlight")}</span>
              </>
            )}
          </h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">
            {banner?.subtitle ?? (banner ? null : t("heroBody"))}
          </p>
          <div className="flex w-full flex-wrap items-center gap-space-md pt-space-xs sm:w-auto">
            <Link
              href={banner?.link ?? "/shop"}
              className="inline-flex items-center justify-center gap-space-xs rounded-full bg-primary px-space-lg py-3.5 text-label-lg text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
            >
              {banner?.ctaLabel ?? t("heroCta")}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <a
              href="#shop-by-age"
              className="inline-flex items-center justify-center gap-space-xs rounded-full bg-surface px-space-lg py-3.5 text-label-lg text-primary shadow-sm transition-colors hover:bg-surface-container"
            >
              <Baby className="size-5" aria-hidden />
              {t("heroSecondaryCta")}
            </a>
          </div>
          <ul className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs pt-space-md text-label-md text-on-surface-variant">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="size-4 text-primary" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-surface-container shadow-xl">
            {banner?.image ? (
              <Image
                src={banner.image.detail}
                alt={banner.title}
                fill
                preload
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : (
              <Image
                src={heroImage}
                alt={t("heroImageAlt")}
                fill
                preload
                placeholder="blur"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 via-transparent to-transparent" />
            <span className="absolute top-4 right-4 flex items-center gap-2 rounded-2xl bg-surface/95 px-3.5 py-2 text-label-sm text-on-surface shadow-md backdrop-blur-md">
              <span className="size-2.5 animate-pulse rounded-full bg-primary" />
              {t("heroNewStock")}
            </span>
            <Link
              href="/category/organic-essentials"
              className="absolute right-5 bottom-5 left-5 flex items-center justify-between rounded-2xl bg-surface/95 p-space-md shadow-lg backdrop-blur-md"
            >
              <span className="flex flex-col">
                <span className="text-label-sm text-primary">{t("heroRecommendLabel")}</span>
                <span className="font-heading text-headline-sm leading-tight font-bold text-on-surface">
                  {t("heroRecommendTitle")}
                </span>
              </span>
              <Sparkles className="size-7 text-primary" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
