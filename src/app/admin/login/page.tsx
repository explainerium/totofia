import { redirect } from "next/navigation";
import { LogoMark } from "@/components/shared/LogoMark";
import { getSessionUser, isStaff } from "@/server/auth/session";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (isStaff(await getSessionUser())) redirect("/admin/dashboard/overview");

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-container-low p-space-md">
      <div className="w-full max-w-sm space-y-space-lg rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-space-lg">
        <div className="flex items-center gap-space-sm">
          <LogoMark className="size-9" />
          <div>
            <h1 className="text-headline-sm">Totofia Admin</h1>
            <p className="text-body-sm text-on-surface-variant">Staff sign in</p>
          </div>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
