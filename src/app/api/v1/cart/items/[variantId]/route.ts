import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { CART_COOKIE, readGuestToken } from "@/server/lib/guest-token";
import { setQuantityInput, variantParams } from "@/server/modules/cart/cart.schema";
import { getCartView, setQuantity } from "@/server/modules/cart/cart.service";

export const PATCH = apiHandler(
  { params: variantParams, body: setQuantityInput },
  async ({ params, body, locale }) => {
    const token = await readGuestToken(CART_COOKIE);
    await setQuantity(token, params.variantId, body.quantity);
    return ok(await getCartView(token, locale));
  },
);

export const DELETE = apiHandler({ params: variantParams }, async ({ params, locale }) => {
  const token = await readGuestToken(CART_COOKIE);
  await setQuantity(token, params.variantId, 0);
  return ok(await getCartView(token, locale));
});
