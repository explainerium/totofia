import "server-only";
import { randomUUID } from "node:crypto";
import type { Asset } from "@/generated/prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  processImage,
  type ImageSize,
} from "../../integrations/image/process";
import { storage } from "../../integrations/storage";

export type ImageUrls = { id: string; width: number | null; height: number | null } & Record<
  ImageSize | "original",
  string
>;

export async function uploadImage(file: File): Promise<ImageUrls> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new ApiError(415, "unsupportedFile");
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, "fileTooLarge");

  const processed = await processImage(Buffer.from(await file.arrayBuffer())).catch(() => {
    throw new ApiError(415, "unsupportedFile");
  });

  const now = new Date();
  const dir = `images/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const id = randomUUID();
  const storageKey = `${dir}/${id}.webp`;
  const derivatives: Record<string, string> = {};

  await storage.put(storageKey, processed.original, "image/webp");
  for (const [size, buffer] of Object.entries(processed.derivatives)) {
    const key = `${dir}/${id}-${size}.webp`;
    await storage.put(key, buffer, "image/webp");
    derivatives[size] = key;
  }

  const asset = await prisma.asset.create({
    data: {
      id,
      storageKey,
      originalName: file.name.slice(0, 200),
      mimeType: "image/webp",
      size: processed.original.length,
      width: processed.width,
      height: processed.height,
      derivatives,
    },
  });
  return imageUrls(asset);
}

/** Browser URLs for every size of an image asset. */
export function imageUrls(
  asset: Pick<Asset, "id" | "storageKey" | "derivatives" | "width" | "height">,
): ImageUrls {
  const d = (asset.derivatives ?? {}) as Partial<Record<ImageSize, string>>;
  const url = (key?: string) => storage.publicUrl(key ?? asset.storageKey);
  return {
    id: asset.id,
    width: asset.width,
    height: asset.height,
    original: url(),
    thumb: url(d.thumb),
    grid: url(d.grid),
    detail: url(d.detail),
    zoom: url(d.zoom),
  };
}
