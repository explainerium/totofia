import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { listQuery } from "@/server/modules/catalog/shared.schema";
import { listCustomers } from "@/server/modules/customer/customer.service";

const query = listQuery.extend({ role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional() });

export const GET = apiHandler({ admin: true, query }, async ({ query }) => {
  const { items, meta } = await listCustomers(query);
  return ok(items, { meta });
});
