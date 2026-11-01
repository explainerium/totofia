import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { readGuestToken, WISHLIST_COOKIE, writeGuestToken } from "@/server/lib/guest-token";
import { toggleWishlist, wishlistProductIds } from "@/server/modules/wishlist/wishlist.service";

const body = z.object({ productId: z.uuid() });

export const POST = apiHandler(
  { body, rateLimit: { name: "wishlist", limit: 60, windowMs: 60_000 } },
  async ({ body, user }) => {
    const result = await toggleWishlist(
      await readGuestToken(WISHLIST_COOKIE),
      body.productId,
      user?.id ?? null,
    );
    await writeGuestToken(WISHLIST_COOKIE, result.token);
    return ok({ saved: result.saved, productIds: await wishlistProductIds(result.token) });
  },
);
