import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { fontVariables } from "@/lib/fonts";
import { AdminProviders } from "@/providers/AdminProviders";

export const metadata: Metadata = {
  title: { default: "Totofia Admin", template: "%s | Totofia Admin" },
  robots: { index: false, follow: false },
};

// Admin panel: English UI, own <html>. Access is checked in dashboard/layout.tsx (staff session).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <AdminProviders>{children}</AdminProviders>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
