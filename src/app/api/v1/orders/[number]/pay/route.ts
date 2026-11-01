import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { retryOnlinePayment } from "@/server/modules/payment/payment.service";

const params = z.object({ number: z.coerce.number().int().min(1).max(2_147_483_647) });
const body = z.object({ token: z.string().min(20).max(64) });

/** "Pay now" again for an unpaid online order (guest link token). */
export const POST = apiHandler(
  { params, body, rateLimit: { name: "pay", limit: 10, windowMs: 10 * 60_000 } },
  async ({ params, body }) =>
    ok({ paymentUrl: await retryOnlinePayment(params.number, body.token) }),
);
