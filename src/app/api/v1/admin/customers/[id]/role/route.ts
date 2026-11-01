import { z } from "zod";
import { ApiError } from "@/server/http/api-error";
import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { getCustomer, setRole } from "@/server/modules/customer/customer.service";

const body = z.object({ role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]) });

// Only ADMIN can grant or remove staff access.
export const PATCH = apiHandler(
  { admin: true, params: idParams, body },
  async ({ params, body, user }) => {
    if (user!.role !== "ADMIN") throw new ApiError(403, "forbidden");
    await setRole(params.id, body.role, user!.id);
    return ok(await getCustomer(params.id));
  },
);
