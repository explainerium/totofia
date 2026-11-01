import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { getCustomer } from "@/server/modules/customer/customer.service";

export const GET = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await getCustomer(params.id)),
);
