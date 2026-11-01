import type { ReactNode } from "react";
import { getSessionUser } from "@/server/auth/session";
import { SiteFooter } from "./footer/SiteFooter";
import { MobileBottomNav } from "./header/MobileBottomNav";
import { SiteHeader } from "./header/SiteHeader";

/** Header, footer and phone bottom nav shared by the shop, auth and account pages. */
export async function StorefrontChrome({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <>
      <SiteHeader user={user ? { firstName: user.name.split(" ")[0] ?? user.name } : null} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileBottomNav signedIn={Boolean(user)} />
    </>
  );
}
