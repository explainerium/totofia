import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";

/**
 * Shared cache for storefront reads (catalog, CMS content, store settings), invalidated by tag when
 * staff change data. Uses `unstable_cache` (the pre-"use cache" model): moving to Cache Components
 * would change how every dynamic page renders, which is not worth the risk right before launch.
 *
 * Cached values are serialized, so Dates come back as ISO strings — cached functions should only
 * return JSON-safe data (our formatters accept strings).
 */
export const TAGS = {
  catalog: "catalog",
  content: "content",
  settings: "settings",
  reviews: "reviews",
} as const;

type Tag = (typeof TAGS)[keyof typeof TAGS];

export function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  key: string,
  tags: Tag[],
  revalidateSeconds = 300,
): (...args: A) => Promise<R> {
  const wrapped = unstable_cache(fn, [key], { tags, revalidate: revalidateSeconds });
  return async (...args: A) => {
    try {
      return await wrapped(...args);
    } catch (error) {
      // Outside a Next.js request (scripts, seed, tests) there is no incremental cache.
      if (
        error instanceof Error &&
        /incrementalCache|static generation store/i.test(error.message)
      ) {
        return fn(...args);
      }
      throw error;
    }
  };
}

/** Marks tagged data stale; the next visitor gets fresh data (no stale window after staff edits). */
export function invalidate(...tags: Tag[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Not inside a Next.js request (seed / scripts) — nothing is cached there anyway.
    }
  }
}
