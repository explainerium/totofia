import "server-only";
import { after } from "next/server";
import { logger } from "./logger";

/**
 * Side work (emails, analytics events) that must neither delay nor fail the response. `after`
 * keeps a serverless function alive until it is done; an un-awaited promise may be cut off.
 * Only callable while handling a request.
 */
export function afterResponse(
  failMessage: string,
  context: Record<string, unknown>,
  task: () => Promise<unknown>,
) {
  after(() => task().catch((err: unknown) => logger.error({ err, ...context }, failMessage)));
}
