"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AdminUser = { name: string; email: string; role: string };

const AdminUserContext = createContext<AdminUser | null>(null);

export function AdminUserProvider({ user, children }: { user: AdminUser; children: ReactNode }) {
  return <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>;
}

/** Signed-in staff member. `isAdmin` gates ADMIN-only actions (roles, settings). */
export function useAdminUser() {
  const user = useContext(AdminUserContext);
  return { user, isAdmin: user?.role === "ADMIN" };
}
