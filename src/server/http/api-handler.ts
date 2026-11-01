import "server-only";
import type { NextRequest } from "next/server";
import { ZodError, type ZodType, type z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import type { Locale } from "@/i18n/routing";
import { assertAdminAccess, assertSignedIn } from "../auth/admin-access";
import { getSessionUser, type SessionUser } from "../auth/session";
import { logger } from "../lib/logger";
import { clientIp, hitRateLimit, type RateLimit } from "../lib/rate-limit";
import { ApiError } from "./api-error";
import { resolveLocale, translateError } from "./messages";
import { fail } from "./response";

type Schema = ZodType | undefined;
type Infer<S extends Schema> = S extends ZodType ? z.infer<S> : undefined;

type Options<B extends Schema, Q extends Schema, P extends Schema> = {
  body?: B;
  query?: Q;
  /** Validates dynamic route segments, e.g. `z.object({ id: z.uuid() })` (invalid → 404). */
  params?: P;
  /** Staff-only route (ADMIN / STAFF session). */
  admin?: boolean;
  /** Signed-in customer required; `ctx.user` is then non-null. */
  auth?: boolean;
  /** Per-IP limit, e.g. `{ name: "checkout", limit: 5, windowMs: 60_000 }`. */
  rateLimit?: RateLimit;
};

type Context<B extends Schema, Q extends Schema, P extends Schema> = {
  req: NextRequest;
  body: Infer<B>;
  query: Infer<Q>;
  params: Infer<P>;
  locale: Locale;
  /** Signed-in user, when there is one (always set for `auth` / `admin` routes). */
  user: SessionUser | null;
};

/**
 * Wraps a Route Handler: checks the session (`admin` / `auth`), validates params/query/body with
 * zod, resolves the response language and maps ApiError / ZodError / Prisma errors to the
 * `{ success: false, ... }` envelope.
 */
export function apiHandler<
  B extends Schema = undefined,
  Q extends Schema = undefined,
  P extends Schema = undefined,
>(options: Options<B, Q, P>, handler: (ctx: Context<B, Q, P>) => Promise<Response>) {
  return async (
    req: NextRequest,
    route: { params: Promise<Record<string, string | string[]>> },
  ) => {
    const locale = resolveLocale(req.headers);
    try {
      const user = options.admin
        ? await assertAdminAccess()
        : options.auth
          ? await assertSignedIn()
          : await getSessionUser();
      if (options.rateLimit && (await hitRateLimit(options.rateLimit, clientIp(req.headers)))) {
        throw new ApiError(429, "tooManyRequests");
      }
      const params = options.params?.safeParse(await route.params);
      if (params && !params.success) throw new ApiError(404, "notFound");
      const query = options.query?.parse(Object.fromEntries(req.nextUrl.searchParams));
      const body = options.body?.parse(await readJson(req));

      return await handler({
        req,
        body: body as Infer<B>,
        query: query as Infer<Q>,
        params: params?.data as Infer<P>,
        locale,
        user,
      });
    } catch (error) {
      return toErrorResponse(error, locale);
    }
  };
}

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "invalidJson");
  }
}

function toErrorResponse(error: unknown, locale: Locale) {
  if (error instanceof ApiError) {
    return fail(error.statusCode, translateError(locale, error.messageKey, error.vars));
  }
  if (error instanceof ZodError) {
    return fail(
      400,
      translateError(locale, "validation"),
      error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return fail(409, translateError(locale, "duplicate"));
    if (error.code === "P2025") return fail(404, translateError(locale, "notFound"));
  }
  logger.error({ err: error }, "Unhandled API error");
  return fail(500, translateError(locale, "internal"));
}
