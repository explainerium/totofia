import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSessionUser, isStaff } from "@/server/auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!isStaff(user)) redirect("/admin/login");

  return (
    <DashboardShell user={{ name: user!.name, email: user!.email, role: user!.role }}>
      {children}
    </DashboardShell>
  );
}
