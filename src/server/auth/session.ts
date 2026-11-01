import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  phone: string | null;
  locale: "bn" | "en";
};

export const STAFF_ROLES = ["ADMIN", "STAFF"] as const;

/** Current signed-in user (or null). Cached per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return null;
  const u = session.user as typeof session.user & Partial<SessionUser> & { banned?: boolean };
  if (u.banned) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role as SessionUser["role"]) ?? "CUSTOMER",
    phone: u.phone ?? null,
    locale: u.locale === "en" ? "en" : "bn",
  };
});

export function isStaff(user: SessionUser | null): boolean {
  return !!user && (STAFF_ROLES as readonly string[]).includes(user.role);
}
