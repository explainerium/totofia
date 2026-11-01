import { markAttempt } from "@/server/modules/payment/payment.service";
import { redirectToOrder } from "../../sslcommerz/_shared";
import { readAamarpayForm } from "../_shared";

// aamarPay may send the customer back here with GET or POST.
async function handle(req: Request) {
  const { tranId } = req.method === "POST" ? await readAamarpayForm(req) : { tranId: undefined };
  const target = tranId ? await markAttempt(tranId, "CANCELLED") : null;
  return redirectToOrder(target, { payment: "cancelled" });
}

export const POST = handle;
export const GET = handle;
