"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ImageDropzone } from "@/components/dashboard/ImageDropzone";
import { Button } from "@/components/ui/button";

/** One optional image stored as an asset id (category image). */
export function SingleImageField({
  name,
  initialUrl,
}: {
  name: string;
  initialUrl: string | null;
}) {
  const { control } = useFormContext();
  const [preview, setPreview] = useState(initialUrl);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) =>
        field.value && preview ? (
          <div className="relative overflow-hidden rounded-xl border border-outline-variant/50">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
            <img src={preview} alt="" className="aspect-square w-full object-cover" />
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="absolute top-2 right-2"
              aria-label="Remove image"
              onClick={() => {
                field.onChange(null);
                setPreview(null);
              }}
            >
              <X />
            </Button>
          </div>
        ) : (
          <ImageDropzone
            onUploaded={(image) => {
              field.onChange(image.id);
              setPreview(image.grid);
            }}
          />
        )
      }
    />
  );
}
