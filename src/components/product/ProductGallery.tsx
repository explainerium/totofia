"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { formatNumber } from "@/lib/format/intl";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; detail: string; zoom: string; thumb: string; alt: string };

/** Main image + thumbnail strip. */
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <section aria-label={t("gallery")} className="space-y-space-sm">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface-container-lowest">
        {current ? (
          <a href={current.zoom} target="_blank" rel="noreferrer" className="block size-full">
            <Image
              src={current.detail}
              alt={current.alt}
              fill
              unoptimized
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </a>
        ) : (
          <div className="grid size-full place-items-center text-outline">
            <ImageOff className="size-12" aria-label={t("noImage")} />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-space-sm overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("showImage", { number: formatNumber(i + 1, locale) })}
              aria-current={i === index}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-container-lowest",
                i === index ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={img.thumb}
                alt=""
                fill
                unoptimized
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
