import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { CART_COOKIE, readGuestToken } from "@/server/lib/guest-token";
import { getCartView } from "@/server/modules/cart/cart.service";

export const GET = apiHandler({}, async ({ locale }) =>
  ok(await getCartView(await readGuestToken(CART_COOKIE), locale)),
);
