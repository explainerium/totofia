import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { listQuery } from "@/server/modules/catalog/shared.schema";
import { manualOrderInput } from "@/server/modules/order/order-admin.schema";
import { createManualOrder } from "@/server/modules/order/order-admin.service";
import { listAdminOrders } from "@/server/modules/order/order.service";

const query = listQuery.extend({
  status: z
    .enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"])
    .optional(),
});

export const GET = apiHandler({ admin: true, query }, async ({ query }) => {
  const { items, meta } = await listAdminOrders(query);
  return ok(items, { meta });
});

/** Phone / walk-in order entered by staff. */
export const POST = apiHandler({ admin: true, body: manualOrderInput }, async ({ body, user }) =>
  ok(await createManualOrder(body, user!), { status: 201 }),
);
