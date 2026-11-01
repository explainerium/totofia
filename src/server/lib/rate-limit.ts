import "server-only";
import { logger } from "./logger";

export type RateLimit = { name: string; limit: number; windowMs: number };

// Fixed-window counters. With UPSTASH_REDIS_REST_URL/TOKEN set they live in Redis and are shared
// by every server instance (needed on Vercel); otherwise they are in memory (one instance).

const buckets = new Map<string, { count: number; resetAt: number }>();

function hitMemory(id: string, windowMs: number): number {
  const now = Date.now();
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return 1;
  }
  bucket.count += 1;
  return bucket.count;
}

async function hitRedis(id: string, windowMs: number): Promise<number> {
  const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify([
      ["INCR", `rl:${id}`],
      ["PEXPIRE", `rl:${id}`, String(windowMs), "NX"],
    ]),
    signal: AbortSignal.timeout(2_000),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const [incr] = (await res.json()) as [{ result: number }];
  return incr.result;
}

/** true when this request goes over the limit. */
export async function hitRateLimit(rule: RateLimit, key: string): Promise<boolean> {
  const id = `${rule.name}:${key}`;
  let count: number;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Redis down must not take checkout down: fall back to the in-memory counter.
    count = await hitRedis(id, rule.windowMs).catch((err) => {
      logger.warn({ err }, "Rate limit store unavailable — using memory");
      return hitMemory(id, rule.windowMs);
    });
  } else {
    count = hitMemory(id, rule.windowMs);
  }
  return count > rule.limit;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local"
  );
}
