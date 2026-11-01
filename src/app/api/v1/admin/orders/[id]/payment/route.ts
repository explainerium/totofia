import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { paymentStatusInput } from "@/server/modules/order/order-admin.schema";
import { setPaymentStatus } from "@/server/modules/order/order-admin.service";
import { getAdminOrder } from "@/server/modules/order/order.service";

export const PATCH = apiHandler(
  { admin: true, params: idParams, body: paymentStatusInput },
  async ({ params, body, user }) => {
    await setPaymentStatus(params.id, body.paymentStatus, user!);
    return ok(await getAdminOrder(params.id));
  },
);
