import "server-only";
import sharp from "sharp";

export const IMAGE_SIZES = { thumb: 160, grid: 480, detail: 960, zoom: 1600 } as const;
export type ImageSize = keyof typeof IMAGE_SIZES;

export type ProcessedImage = {
  width: number;
  height: number;
  /** Full-size WebP (capped at the zoom width). */
  original: Buffer;
  derivatives: Record<ImageSize, Buffer>;
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
/** Vercel functions reject request bodies over 4.5 MB; the admin shrinks bigger photos first. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Auto-rotates, strips metadata and converts to WebP in every size we serve. */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const base = sharp(input, { failOn: "error" }).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error("Not a valid image");

  const toWebp = (width: number) =>
    base.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();

  const entries = await Promise.all(
    (Object.keys(IMAGE_SIZES) as ImageSize[]).map(
      async (size) => [size, await toWebp(IMAGE_SIZES[size])] as const,
    ),
  );
  const original = await toWebp(IMAGE_SIZES.zoom);
  const { width, height } = await sharp(original).metadata();

  return {
    width: width ?? meta.width,
    height: height ?? meta.height,
    original,
    derivatives: Object.fromEntries(entries) as Record<ImageSize, Buffer>,
  };
}
