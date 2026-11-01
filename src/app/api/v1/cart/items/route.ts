import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { CART_COOKIE, readGuestToken, writeGuestToken } from "@/server/lib/guest-token";
import { addItemInput } from "@/server/modules/cart/cart.schema";
import { addItem, getCartView } from "@/server/modules/cart/cart.service";

export const POST = apiHandler(
  { body: addItemInput, rateLimit: { name: "cart", limit: 60, windowMs: 60_000 } },
  async ({ body, locale, user }) => {
    const token = await addItem(
      await readGuestToken(CART_COOKIE),
      body.variantId,
      body.quantity,
      user?.id ?? null,
    );
    await writeGuestToken(CART_COOKIE, token);
    return ok(await getCartView(token, locale));
  },
);
