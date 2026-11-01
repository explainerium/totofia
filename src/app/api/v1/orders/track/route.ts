import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { trackInput } from "@/server/modules/checkout/checkout.schema";
import { trackOrder } from "@/server/modules/order/order.service";

// POST so the phone number never ends up in URLs or access logs.
export const POST = apiHandler(
  { body: trackInput, rateLimit: { name: "track", limit: 10, windowMs: 10 * 60_000 } },
  async ({ body, locale }) => ok(await trackOrder(body.number, body.phone, locale)),
);
