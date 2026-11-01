import { apiHandler } from "@/server/http/api-handler";
import { ApiError } from "@/server/http/api-error";
import { ok } from "@/server/http/response";
import { sendPurchaseEvent } from "@/server/integrations/meta/capi";
import { afterResponse } from "@/server/lib/after-response";
import { CART_COOKIE, readGuestToken } from "@/server/lib/guest-token";
import { logger } from "@/server/lib/logger";
import { checkoutInput } from "@/server/modules/checkout/checkout.schema";
import { placeOrder } from "@/server/modules/checkout/checkout.service";
import { enabledOnlineMethods } from "@/server/modules/payment/gateway-settings.service";
import { startOnlinePayment } from "@/server/modules/payment/payment.service";

// Guests and signed-in customers alike; a signed-in order is linked to the account.
// Online payment: the order is created first (stock reserved), then the customer is sent to the
// gateway. If the gateway is unreachable the order page offers "Pay now" again.
export const POST = apiHandler(
  { body: checkoutInput, rateLimit: { name: "checkout", limit: 5, windowMs: 10 * 60_000 } },
  async ({ body, locale, user }) => {
    const online = body.paymentMethod !== "COD";
    if (online && !(await enabledOnlineMethods()).includes(body.paymentMethod as never)) {
      throw new ApiError(503, "paymentUnavailable");
    }

    const order = await placeOrder(
      await readGuestToken(CART_COOKIE),
      locale,
      body,
      user?.id ?? null,
    );
    // COD counts as a purchase now; online orders when the payment is confirmed.
    if (!online) {
      afterResponse("Purchase event failed", { orderId: order.id }, () =>
        sendPurchaseEvent(order.id),
      );
    }
    let paymentUrl: string | null = null;
    if (online) {
      paymentUrl = await startOnlinePayment(order.id).catch((err) => {
        logger.error({ err, order: order.number }, "Could not start online payment");
        return null;
      });
    }
    return ok({ number: order.number, token: order.token, paymentUrl }, { status: 201 });
  },
);
