import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { statusChangeInput } from "@/server/modules/order/order-admin.schema";
import { changeOrderStatus } from "@/server/modules/order/order-admin.service";
import { getAdminOrder } from "@/server/modules/order/order.service";

export const PATCH = apiHandler(
  { admin: true, params: idParams, body: statusChangeInput },
  async ({ params, body, user }) => {
    await changeOrderStatus(params.id, body, user!);
    return ok(await getAdminOrder(params.id));
  },
);
