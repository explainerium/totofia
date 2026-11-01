"use client";

import { ExternalLink, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { AdminUserProvider } from "./AdminUserContext";
import { Sidebar } from "./Sidebar";

type ShellUser = { name: string; email: string; role: string };

export function DashboardShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <AdminUserProvider user={user}>
      <div className="flex min-h-dvh bg-surface-container-low">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-outline-variant/50 bg-surface-container-lowest lg:block">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-space-md border-b border-outline-variant/50 bg-surface-container-lowest/95 px-space-md backdrop-blur">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Sidebar onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="hidden text-body-sm text-on-surface-variant sm:inline">
              {user.name} · {user.email} · <span className="lowercase">{user.role}</span>
            </span>
            <div className="flex gap-space-sm">
              <Button variant="outline" size="sm" asChild>
                <a href="/" target="_blank" rel="noreferrer">
                  View store <ExternalLink />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await authClient.signOut();
                  router.replace("/admin/login");
                  router.refresh();
                }}
              >
                <LogOut /> Sign out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-space-md md:p-space-lg">{children}</main>
        </div>
      </div>
    </AdminUserProvider>
  );
}
