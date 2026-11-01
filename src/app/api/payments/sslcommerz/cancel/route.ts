import { markAttempt } from "@/server/modules/payment/payment.service";
import { readGatewayForm, redirectToOrder } from "../_shared";

export async function POST(req: Request) {
  const { tranId } = await readGatewayForm(req);
  const target = tranId ? await markAttempt(tranId, "CANCELLED") : null;
  return redirectToOrder(target, { payment: "cancelled" });
}
