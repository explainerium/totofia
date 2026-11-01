import { ChevronRight, HeartHandshake, RefreshCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ProductGrid } from "@/components/product/ProductCard";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/intl";
import { AGE_RANGES } from "@/server/domain/catalog/age-ranges";
import type { NavCategory, ProductCard } from "@/server/modules/catalog/catalog.service";
import { SectionHeading } from "../SectionHeading";

const container = "mx-auto max-w-shop px-margin-sm md:px-gutter";

export function CategoryGrid({ categories }: { categories: NavCategory[] }) {
  const t = useTranslations("Home");
  if (!categories.length) return null;
  return (
    <section className="bg-surface py-space-xl">
      <div className={container}>
        <SectionHeading
          eyebrow={t("categoriesEyebrow")}
          title={t("categoriesTitle")}
          body={t("categoriesBody")}
        />
        <div className="grid grid-cols-2 gap-space-md md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex flex-col rounded-2xl bg-surface-container-low p-space-md shadow-sm transition-all hover:bg-surface-container hover:shadow-md"
            >
              <span className="relative mb-space-sm aspect-square w-full overflow-hidden rounded-xl bg-surface">
                {c.image ? (
                  <Image
                    src={c.image.grid}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 16vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
              </span>
              <span className="font-heading text-[16px] font-bold text-on-surface transition-colors group-hover:text-primary">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts({ products }: { products: ProductCard[] }) {
  const t = useTranslations("Home");
  if (!products.length) return null;
  return (
    <section id="featured-products" className="bg-surface-container-low py-space-xl">
      <div className={container}>
        <SectionHeading
          eyebrow={t("featuredEyebrow")}
          title={t("featuredTitle")}
          action={
            <Link
              href="/shop"
              className="self-start rounded-full bg-surface px-space-md py-2 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container md:self-auto"
            >
              {t("viewAll")}
            </Link>
          }
        />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

const ageBlobs = [
  "bg-primary-fixed/30",
  "bg-secondary-fixed/40",
  "bg-tertiary-fixed/50",
  "bg-primary-fixed-dim/40",
];

export function ShopByAge() {
  const t = useTranslations("Home");
  const ta = useTranslations("Age");
  const locale = useLocale();
  return (
    <section id="shop-by-age" className="scroll-mt-40 bg-surface py-space-xl">
      <div className={container}>
        <SectionHeading
          eyebrow={t("ageEyebrow")}
          title={t("ageTitle")}
          body={t("ageBody")}
          center
        />
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          {AGE_RANGES.map((range, i) => (
            <Link
              key={range.code}
              href={`/age/${range.code}`}
              className="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-3xl bg-surface-container p-space-lg transition-all hover:shadow-md"
            >
              <span className="z-10">
                <span className="mb-space-sm inline-block rounded-full bg-surface px-3 py-1 text-label-sm text-primary">
                  {t("ageStep", {
                    step: formatNumber(i + 1, locale).padStart(2, formatNumber(0, locale)),
                  })}
                </span>
                <span className="block font-heading text-headline-md font-bold text-on-surface">
                  {ta(range.code)}
                </span>
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  {ta(`${range.code}Range`)}
                </span>
              </span>
              <span className="z-10 flex items-center text-label-md text-primary transition-transform group-hover:translate-x-1">
                {t("viewProducts")}
                <ChevronRight className="ml-1 size-4" aria-hidden />
              </span>
              <span
                className={`absolute -right-4 -bottom-4 size-28 rounded-full transition-transform duration-500 group-hover:scale-125 ${ageBlobs[i]}`}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyTrustUs() {
  const t = useTranslations("Home");
  const pillars = [
    { icon: ShieldCheck, title: t("pillarSafeTitle"), body: t("pillarSafeBody") },
    { icon: RefreshCcw, title: t("pillarReturnTitle"), body: t("pillarReturnBody") },
    { icon: HeartHandshake, title: t("pillarSupportTitle"), body: t("pillarSupportBody") },
  ];
  return (
    <section className="bg-surface-container-lowest py-space-xl">
      <div className={container}>
        <div className="rounded-3xl bg-surface-container-high p-space-lg md:p-space-xl">
          <SectionHeading eyebrow={t("trustEyebrow")} title={t("trustTitle")} center />
          <div className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col items-center rounded-2xl bg-surface p-space-lg text-center shadow-sm"
              >
                <span className="mb-space-md flex size-14 items-center justify-center rounded-2xl bg-surface-container text-primary">
                  <Icon className="size-8" aria-hidden />
                </span>
                <h3 className="mb-space-xs text-headline-sm font-bold text-on-surface">{title}</h3>
                <p className="text-body-md text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
