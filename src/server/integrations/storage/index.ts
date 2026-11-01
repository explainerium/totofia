import "server-only";
import { env } from "../../lib/env";
import { localDriver } from "./local-driver";
import { createR2Driver } from "./r2-driver";
import type { StorageDriver } from "./types";

// Local disk in development (served at /media/...), Cloudflare R2 in production.
export const storage: StorageDriver = env.STORAGE_DRIVER === "r2" ? createR2Driver() : localDriver;
