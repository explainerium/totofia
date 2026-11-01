import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { readGuestToken, WISHLIST_COOKIE } from "@/server/lib/guest-token";
import { wishlistProductIds } from "@/server/modules/wishlist/wishlist.service";

export const GET = apiHandler({}, async () =>
  ok({ productIds: await wishlistProductIds(await readGuestToken(WISHLIST_COOKIE)) }),
);
