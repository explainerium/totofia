import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { normalizeBdPhone } from "@/lib/format/phone";
import { prisma } from "../db/prisma";
import { CART_COOKIE, WISHLIST_COOKIE } from "../lib/guest-token";
import { logger } from "../lib/logger";
import { sendPasswordResetEmail } from "../modules/account/account.mail";
import { mergeGuestCart, mergeGuestWishlist } from "../modules/account/guest-merge";

const GUEST_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const auth = betterAuth({
  appName: "Totofia",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  // `next dev` may pick another port when 3000 is taken — trust any localhost origin in development.
  trustedOrigins: async (request) => {
    const origin = request?.headers.get("origin");
    return process.env.NODE_ENV !== "production" &&
      origin &&
      /^http:\/\/localhost:\d+$/.test(origin)
      ? [origin]
      : [];
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    cookiePrefix: "tf",
    database: { generateId: "uuid" },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.id, url);
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "CUSTOMER" },
      phone: { type: "string", required: false },
      locale: { type: "string", required: false, defaultValue: "bn" },
      banned: { type: "boolean", input: false, defaultValue: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily while in use
  },
  rateLimit: { enabled: true, window: 60, max: 20 },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { ...user, ...cleanProfile(user) } }),
      },
      update: {
        before: async (user) => ({ data: { ...user, ...cleanProfile(user) } }),
      },
    },
    session: {
      create: {
        // Blocked customers cannot sign in.
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { banned: true },
          });
          if (user?.banned) throw new APIError("FORBIDDEN", { code: "ACCOUNT_BLOCKED" });
        },
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const signedIn = ctx.path === "/sign-in/email" || ctx.path === "/sign-up/email";
      const session = ctx.context.newSession;

      if (signedIn && session) {
        // Guest bag and wishlist follow the customer into their account.
        try {
          const cart = await mergeGuestCart(session.user.id, ctx.getCookie(CART_COOKIE) ?? null);
          const wishlist = await mergeGuestWishlist(
            session.user.id,
            ctx.getCookie(WISHLIST_COOKIE) ?? null,
          );
          const maxAge = 60 * 60 * 24 * 30;
          if (cart) ctx.setCookie(CART_COOKIE, cart, { ...GUEST_COOKIE_OPTIONS, maxAge });
          if (wishlist)
            ctx.setCookie(WISHLIST_COOKIE, wishlist, { ...GUEST_COOKIE_OPTIONS, maxAge });
        } catch (err) {
          logger.error({ err }, "Guest cart/wishlist merge failed");
        }
      }

      if (ctx.path === "/sign-out") {
        // The next visitor on this browser starts with an empty bag.
        ctx.setCookie(CART_COOKIE, "", { ...GUEST_COOKIE_OPTIONS, maxAge: 0 });
        ctx.setCookie(WISHLIST_COOKIE, "", { ...GUEST_COOKIE_OPTIONS, maxAge: 0 });
      }
    }),
  },
  plugins: [nextCookies()], // must stay last
});

/** Normalizes phone (or rejects it) and keeps locale to bn/en. */
function cleanProfile(user: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (typeof user.phone === "string") {
    if (user.phone.trim() === "") out.phone = null;
    else {
      const phone = normalizeBdPhone(user.phone);
      if (!phone) throw new APIError("BAD_REQUEST", { code: "INVALID_PHONE" });
      out.phone = phone;
    }
  }
  if (user.locale !== undefined && user.locale !== "bn" && user.locale !== "en") out.locale = "bn";
  return out;
}

export type AuthSession = typeof auth.$Infer.Session;
