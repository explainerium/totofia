import { markAttempt } from "@/server/modules/payment/payment.service";
import { redirectToOrder } from "../../sslcommerz/_shared";
import { readAamarpayForm } from "../_shared";

export async function POST(req: Request) {
  const { tranId, reason } = await readAamarpayForm(req);
  const target = tranId ? await markAttempt(tranId, "FAILED", reason) : null;
  return redirectToOrder(target, { payment: "failed" });
}
