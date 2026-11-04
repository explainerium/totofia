import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../../lib/env";
import type { StorageDriver } from "./types";

/**
 * Cloudinary as plain file storage (no transformations: sizes are made with sharp before upload).
 * The storage key minus its extension is the public id, so `<base>/<key>` is the delivery URL.
 */
export function createCloudinaryDriver(): StorageDriver {
  const {
    CLOUDINARY_CLOUD_NAME: cloud,
    CLOUDINARY_API_KEY: apiKey,
    CLOUDINARY_API_SECRET: secret,
  } = env;
  if (!cloud || !apiKey || !secret) {
    throw new Error(
      "STORAGE_DRIVER=cloudinary needs CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET",
    );
  }
  cloudinary.config({ cloud_name: cloud, api_key: apiKey, api_secret: secret, secure: true });

  const base = cloudinaryMediaUrl(cloud);
  const publicId = (key: string) => key.replace(/\.[a-z0-9]+$/i, "");

  return {
    put(key, body) {
      // Upload straight from memory (no temp file), like multer's memoryStorage + upload_stream.
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ public_id: publicId(key), resource_type: "image" }, (error) =>
            error ? reject(error) : resolve(),
          )
          .end(body);
      });
    },
    async get(key) {
      const res = await fetch(`${base}/${key}`);
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    },
    async delete(key) {
      await cloudinary.uploader.destroy(publicId(key), { invalidate: true });
    },
    publicUrl(key) {
      return `${base}/${key}`;
    },
  };
}

export const cloudinaryMediaUrl = (cloud: string) =>
  `https://res.cloudinary.com/${cloud}/image/upload`;
