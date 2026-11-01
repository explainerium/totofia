import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const CART_COOKIE = "tf_cart";
export const WISHLIST_COOKIE = "tf_wishlist";
const MAX_AGE_DAYS = 30;

export const GUEST_TTL_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export function newToken(): string {
  return randomBytes(24).toString("base64url");
}

export { orderTokenCookie, RESET_TOKEN_COOKIE } from "@/lib/access-cookies";

/**
 * Access token of a link (guest order page, password reset): `?token=` if still in the URL,
 * else the cookie proxy.ts moved it into so analytics, history and referrers never see it.
 */
export async function readAccessToken(fromQuery: unknown, cookieName: string) {
  if (typeof fromQuery === "string" && fromQuery) return fromQuery;
  return (await cookies()).get(cookieName)?.value ?? null;
}

/** Opaque guest token from an httpOnly cookie (cart / wishlist). */
export async function readGuestToken(name: string): Promise<string | null> {
  const value = (await cookies()).get(name)?.value;
  return value && /^[\w-]{20,64}$/.test(value) ? value : null;
}

export async function writeGuestToken(name: string, token: string) {
  (await cookies()).set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });
}
