import "server-only";
import { env } from "../../lib/env";
import { createCloudinaryDriver } from "./cloudinary-driver";
import { localDriver } from "./local-driver";
import { createR2Driver } from "./r2-driver";
import type { StorageDriver } from "./types";

// Local disk in development and on a VPS (served at /media/...); Cloudinary or R2 on Vercel.
export const storage: StorageDriver =
  env.STORAGE_DRIVER === "cloudinary"
    ? createCloudinaryDriver()
    : env.STORAGE_DRIVER === "r2"
      ? createR2Driver()
      : localDriver;
