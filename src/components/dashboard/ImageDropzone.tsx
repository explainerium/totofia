"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/axios";
import { cn } from "@/lib/utils";
import { useUploadImageMutation } from "@/redux/api/mediaApi";
import type { ImageUrls } from "@/server/modules/media/media.service";

type ImageDropzoneProps = {
  onUploaded: (image: ImageUrls) => void;
  multiple?: boolean;
  className?: string;
};

/** Server limit (MAX_UPLOAD_BYTES): Vercel functions reject request bodies over 4.5 MB. */
const MAX_UPLOAD = 4 * 1024 * 1024;
/** Above the largest size the site serves (1600px), so shrinking loses nothing visible. */
const MAX_EDGE = 2400;

/** Phone photos are often over the upload limit: big files are scaled down in the browser. */
async function fitForUpload(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
  // Browsers without WebP encoding hand back PNG instead; JPEG is then the smaller choice.
  let blob = await encode("image/webp");
  if (blob?.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob || blob.size > MAX_UPLOAD) throw new Error("Image is still too large.");
  const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
  return new File([blob], file.name.replace(/\.\w+$/, "") + ext, { type: blob.type });
}

/** Drag & drop / click to upload. Each file is uploaded (WebP + sizes) as soon as it is dropped. */
export function ImageDropzone({ onUploaded, multiple = false, className }: ImageDropzoneProps) {
  const [upload] = useUploadImageMutation();
  const [pending, setPending] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/avif": [] },
    maxSize: 30 * 1024 * 1024,
    multiple,
    onDropRejected: () => toast.error("Only JPG, PNG, WebP or AVIF images up to 30 MB."),
    onDropAccepted: async (files) => {
      setPending((n) => n + files.length);
      for (const file of files) {
        try {
          onUploaded(await upload(await fitForUpload(file)).unwrap());
        } catch (error) {
          toast.error(
            isApiError(error)
              ? error.message
              : error instanceof Error
                ? error.message
                : "Upload failed.",
          );
        } finally {
          setPending((n) => n - 1);
        }
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-space-xs rounded-xl border-2 border-dashed border-outline-variant p-space-lg text-center text-body-sm text-on-surface-variant transition-colors hover:border-primary hover:bg-surface-container-low",
        isDragActive && "border-primary bg-surface-container-low",
        className,
      )}
    >
      <input {...getInputProps()} />
      {pending > 0 ? (
        <Loader2 className="size-6 animate-spin text-primary" />
      ) : (
        <ImagePlus className="size-6 text-primary" />
      )}
      <span>
        {pending > 0
          ? `Uploading ${pending} image${pending > 1 ? "s" : ""}…`
          : `Drop image${multiple ? "s" : ""} here or click to choose`}
      </span>
      <span className="text-label-sm">JPG, PNG, WebP, AVIF · large photos are resized</span>
    </div>
  );
}
