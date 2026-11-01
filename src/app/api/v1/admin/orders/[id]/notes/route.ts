import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { orderNoteInput } from "@/server/modules/order/order-admin.schema";
import { addOrderNote } from "@/server/modules/order/order-admin.service";
import { getAdminOrder } from "@/server/modules/order/order.service";

export const POST = apiHandler(
  { admin: true, params: idParams, body: orderNoteInput },
  async ({ params, body, user }) => {
    await addOrderNote(params.id, body.body, user!);
    return ok(await getAdminOrder(params.id), { status: 201 });
  },
);
