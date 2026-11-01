import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { CART_COOKIE, readGuestToken } from "@/server/lib/guest-token";
import { couponInput } from "@/server/modules/cart/cart.schema";
import { getCartView, setCoupon } from "@/server/modules/cart/cart.service";
import { checkCoupon } from "@/server/modules/checkout/checkout.service";

export const POST = apiHandler(
  { body: couponInput, rateLimit: { name: "coupon", limit: 10, windowMs: 60_000 } },
  async ({ body, locale }) => {
    const token = await readGuestToken(CART_COOKIE);
    const cart = await getCartView(token, locale);
    const code = await checkCoupon(body.code, cart.subtotal);
    await setCoupon(token, code);
    return ok(await getCartView(token, locale));
  },
);

export const DELETE = apiHandler({}, async ({ locale }) => {
  const token = await readGuestToken(CART_COOKIE);
  await setCoupon(token, null);
  return ok(await getCartView(token, locale));
});
