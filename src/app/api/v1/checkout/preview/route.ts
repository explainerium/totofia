import { normalizeBdPhone } from "@/lib/format/phone";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { CART_COOKIE, readGuestToken } from "@/server/lib/guest-token";
import { previewInput } from "@/server/modules/checkout/checkout.schema";
import { previewCheckout } from "@/server/modules/checkout/checkout.service";
import { enabledOnlineMethods } from "@/server/modules/payment/gateway-settings.service";

export const POST = apiHandler({ body: previewInput }, async ({ body, locale }) => {
  const onlineMethods = await enabledOnlineMethods();
  return ok({
    ...(await previewCheckout(await readGuestToken(CART_COOKIE), locale, {
      district: body.district,
      phone: body.phone ? (normalizeBdPhone(body.phone) ?? undefined) : undefined,
    })),
    /** Online gateways enabled in Admin → Settings → Payments (in display order). */
    onlineMethods,
    /** @deprecated use onlineMethods — kept for the current checkout UI. */
    onlinePayment: onlineMethods.length > 0,
  });
});
