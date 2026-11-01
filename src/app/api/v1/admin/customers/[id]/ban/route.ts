import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { getCustomer, setBanned } from "@/server/modules/customer/customer.service";

const body = z.object({ banned: z.boolean() });

export const PATCH = apiHandler(
  { admin: true, params: idParams, body },
  async ({ params, body, user }) => {
    await setBanned(params.id, body.banned, user!);
    return ok(await getCustomer(params.id));
  },
);
