import { markAttempt } from "@/server/modules/payment/payment.service";
import { readGatewayForm, redirectToOrder } from "../_shared";

export async function POST(req: Request) {
  const { tranId, error } = await readGatewayForm(req);
  const target = tranId ? await markAttempt(tranId, "FAILED", error) : null;
  return redirectToOrder(target, { payment: "failed" });
}
