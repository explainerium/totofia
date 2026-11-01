import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { getAdminOrder } from "@/server/modules/order/order.service";

export const GET = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await getAdminOrder(params.id)),
);
