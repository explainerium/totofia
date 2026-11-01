import { logger } from "@/server/lib/logger";
import { settlePayment } from "@/server/modules/payment/payment.service";
import { readGatewayForm } from "../_shared";

// Server-to-server notification from SSLCommerz (the reliable path — the browser may never come
// back). Validated through the gateway API; safe to receive more than once.
export async function POST(req: Request) {
  const { tranId, valId } = await readGatewayForm(req);
  if (!tranId) return new Response("missing tran_id", { status: 400 });
  try {
    const outcome = await settlePayment(tranId, valId);
    return new Response(outcome.paid ? "PAID" : "NOT_PAID", { status: 200 });
  } catch (err) {
    logger.error({ err, tranId }, "IPN handling failed");
    return new Response("error", { status: 500 });
  }
}
