import { logger } from "@/server/lib/logger";
import { settlePayment } from "@/server/modules/payment/payment.service";
import { redirectToOrder } from "../../sslcommerz/_shared";
import { readAamarpayForm } from "../_shared";

// Browser redirect after paying. Posted fields are NOT trusted — settlePayment asks aamarPay's
// transaction API.
export async function POST(req: Request) {
  const { tranId } = await readAamarpayForm(req);
  if (!tranId) return redirectToOrder(null, {});
  try {
    const outcome = await settlePayment(tranId);
    return redirectToOrder(
      outcome,
      outcome.paid ? { placed: "1", paid: "1" } : { payment: "failed" },
    );
  } catch (err) {
    logger.error({ err, tranId }, "aamarPay success callback failed");
    return redirectToOrder(null, {});
  }
}
