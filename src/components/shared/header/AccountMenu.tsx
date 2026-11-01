"use client";

import { ChevronDown, LogOut, Package, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAfterAuth } from "@/components/storefront/auth/useAfterAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

const triggerClass =
  "hidden items-center gap-space-xs rounded-lg px-space-sm py-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary lg:flex";

/** Header account entry: sign-in link for guests, name + menu for signed-in customers. */
export function AccountMenu({ user }: { user: { firstName: string } | null }) {
  const t = useTranslations("Header");
  const tAuth = useTranslations("Auth");
  const afterAuth = useAfterAuth();

  if (!user) {
    return (
      <Link href="/login" className={triggerClass}>
        <UserRound className="size-6" aria-hidden />
        <span className="flex flex-col text-left leading-tight">
          <span className="text-label-sm text-on-surface-variant">{t("welcome")}</span>
          <span className="text-label-md text-on-surface">{t("signInOrRegister")}</span>
        </span>
      </Link>
    );
  }

  const signOut = async () => {
    await authClient.signOut();
    toast.success(tAuth("signedOutToast"));
    afterAuth("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClass} aria-label={t("accountMenu")}>
        <UserRound className="size-6" aria-hidden />
        <span className="flex flex-col text-left leading-tight">
          <span className="text-label-sm text-on-surface-variant">
            {t("hello", { name: user.firstName })}
          </span>
          <span className="flex items-center gap-1 text-label-md text-on-surface">
            {t("myAccount")} <ChevronDown className="size-3.5" aria-hidden />
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserRound aria-hidden /> {t("myAccount")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders">
            <Package aria-hidden /> {t("myOrders")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut}>
          <LogOut aria-hidden /> {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
