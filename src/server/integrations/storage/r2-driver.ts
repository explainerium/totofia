import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../lib/env";
import type { StorageDriver } from "./types";

/** Cloudflare R2 (S3-compatible). Files are public through NEXT_PUBLIC_MEDIA_URL (custom domain). */
export function createR2Driver(): StorageDriver {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    NEXT_PUBLIC_MEDIA_URL,
  } = env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !NEXT_PUBLIC_MEDIA_URL
  ) {
    throw new Error("STORAGE_DRIVER=r2 needs R2_* and NEXT_PUBLIC_MEDIA_URL");
  }
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
  const base = NEXT_PUBLIC_MEDIA_URL.replace(/\/$/, "");

  return {
    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: body,
          ContentType: contentType,
          // Keys are content-unique (uuid), so files can be cached forever.
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    },
    async get(key) {
      try {
        const res = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
        return res.Body ? Buffer.from(await res.Body.transformToByteArray()) : null;
      } catch (error) {
        if (error instanceof NoSuchKey) return null;
        throw error;
      }
    },
    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    },
    publicUrl(key) {
      return `${base}/${key}`;
    },
  };
}
