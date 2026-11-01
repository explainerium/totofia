"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/shared/LogoMark";
import { cn } from "@/lib/utils";
import { useGetMessagesQuery, useGetReviewsQuery } from "@/redux/api/inboxApi";
import { navGroups, type NavItem } from "./nav-items";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // Only the counters are needed: one row each.
  const { data: messages } = useGetMessagesQuery({ status: "NEW", limit: 1 });
  const { data: reviews } = useGetReviewsQuery({ status: "PENDING", limit: 1 });
  const badges: Record<NonNullable<NavItem["badge"]>, number> = {
    unreadMessages: messages?.unread ?? 0,
    pendingReviews: reviews?.pending ?? 0,
  };

  // The most specific item wins (Settings vs Settings → Payments).
  const activeHref = navGroups
    .flatMap((g) => g.items.map((i) => i.href))
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav className="flex h-full flex-col gap-space-md overflow-y-auto p-space-md">
      <Link href="/admin/dashboard/overview" className="flex items-center gap-space-sm px-2">
        <LogoMark className="size-8" />
        <span className="font-heading text-headline-sm font-bold text-primary">Totofia Admin</span>
      </Link>
      {navGroups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 text-label-sm tracking-wide text-outline uppercase">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon, badge }) => {
              const active = href === activeHref;
              const count = badge ? badges[badge] : 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-space-sm rounded-lg px-3 py-1.5 text-label-lg transition-colors",
                      active
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="flex-1">{label}</span>
                    {count > 0 ? (
                      <span
                        className={cn(
                          "min-w-5 rounded-full px-1.5 text-center text-label-sm",
                          active ? "bg-on-primary text-primary" : "bg-error text-on-error",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
