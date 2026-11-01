import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { LiveBanner } from "@/server/modules/content/banner.service";

/** HOME_PROMO banners (Admin → Banners): image + message + call to action. */
export function HomePromo({ banners }: { banners: LiveBanner[] }) {
  if (!banners.length) return null;

  return (
    <section className="mx-auto max-w-shop space-y-space-md px-margin-sm py-space-lg md:px-gutter">
      {banners.map((b) => {
        const body = (
          <div className="grid overflow-hidden rounded-3xl bg-primary text-on-primary md:grid-cols-5">
            <div className="flex flex-col justify-center gap-space-sm p-space-lg md:col-span-3 md:p-space-xl">
              <h2 className="font-heading text-headline-lg-mobile md:text-headline-lg">
                {b.title}
              </h2>
              {b.subtitle ? <p className="text-body-lg text-on-primary/85">{b.subtitle}</p> : null}
              {b.link && b.ctaLabel ? (
                <span className="mt-space-sm inline-flex w-fit items-center gap-space-xs rounded-full bg-surface px-space-lg py-3 text-label-lg text-primary">
                  {b.ctaLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              ) : null}
            </div>
            {b.image ? (
              <div className="relative min-h-48 md:col-span-2">
                <Image
                  src={b.image.detail}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        );
        return b.link ? (
          <Link
            key={b.id}
            href={b.link}
            className="block transition-transform hover:-translate-y-0.5"
          >
            {body}
          </Link>
        ) : (
          <div key={b.id}>{body}</div>
        );
      })}
    </section>
  );
}
