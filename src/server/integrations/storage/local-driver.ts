import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageDriver } from "./types";

const ROOT = path.join(process.cwd(), "uploads");

function resolve(key: string): string {
  const full = path.resolve(ROOT, key);
  // Keys come from our own code, but never let one escape the uploads folder.
  if (!full.startsWith(ROOT + path.sep)) throw new Error(`Invalid storage key: ${key}`);
  return full;
}

/** Development driver: files under ./uploads, served by `app/media/[...key]/route.ts`. */
export const localDriver: StorageDriver = {
  async put(key, body) {
    const file = resolve(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  },
  async get(key) {
    try {
      return await readFile(resolve(key));
    } catch {
      return null;
    }
  },
  async delete(key) {
    await rm(resolve(key), { force: true });
  },
  publicUrl(key) {
    return `/media/${key}`;
  },
};
