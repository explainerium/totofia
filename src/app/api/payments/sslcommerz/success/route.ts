import { logger } from "@/server/lib/logger";
import { settlePayment } from "@/server/modules/payment/payment.service";
import { readGatewayForm, redirectToOrder } from "../_shared";

// Browser redirect after paying. The posted fields are NOT trusted — settlePayment asks the
// gateway's validation API.
export async function POST(req: Request) {
  const { tranId, valId } = await readGatewayForm(req);
  if (!tranId) return redirectToOrder(null, {});
  try {
    const outcome = await settlePayment(tranId, valId);
    return redirectToOrder(
      outcome,
      outcome.paid ? { placed: "1", paid: "1" } : { payment: "failed" },
    );
  } catch (err) {
    logger.error({ err, tranId }, "Payment success callback failed");
    return redirectToOrder(null, {});
  }
}
