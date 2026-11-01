"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ImageDropzone } from "@/components/dashboard/ImageDropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProduct } from "@/server/modules/product/product.service";
import type { ProductFormValues } from "./product-form-values";

/** Ordered gallery: upload, reorder, remove and set alt text per language. */
export function ProductImagesField({ initial }: { initial: AdminProduct["images"] }) {
  const { control, register } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "images" });
  // Preview URLs by asset id (the form itself only stores ids).
  const [previews, setPreviews] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.map((img) => [img.assetId, img.url])),
  );

  return (
    <div className="space-y-space-md">
      {fields.length > 0 ? (
        <ul className="space-y-space-sm">
          {fields.map((field, i) => (
            <li
              key={field.id}
              className="flex flex-wrap items-center gap-space-md rounded-xl border border-outline-variant/50 p-space-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
              <img
                src={previews[field.assetId]}
                alt=""
                className="size-16 rounded-lg bg-surface-container object-cover"
              />
              <div className="grid min-w-48 flex-1 gap-space-xs sm:grid-cols-2">
                <Input
                  lang="bn"
                  placeholder="Alt text (বাংলা)"
                  {...register(`images.${i}.altBn`)}
                />
                <Input placeholder="Alt text (English)" {...register(`images.${i}.altEn`)} />
              </div>
              <div className="flex items-center gap-1">
                {i === 0 ? <Badge>Main</Badge> : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move down"
                  disabled={i === fields.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove image"
                  onClick={() => remove(i)}
                >
                  <X className="text-error" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <ImageDropzone
        multiple
        onUploaded={(image) => {
          setPreviews((p) => ({ ...p, [image.id]: image.thumb }));
          append({ assetId: image.id, altBn: "", altEn: "" });
        }}
      />
    </div>
  );
}
