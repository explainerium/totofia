"use client";

import { useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { baseApi } from "@/redux/api/baseApi";

/**
 * After sign-in / sign-up / sign-out the bag and wishlist cookies change on the server, so the
 * cached client data and the server-rendered header must both be refreshed.
 */
export function useAfterAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  return (to?: string) => {
    dispatch(baseApi.util.invalidateTags(["Cart", "Wishlist", "Account"]));
    if (to) router.replace(to);
    router.refresh();
  };
}
