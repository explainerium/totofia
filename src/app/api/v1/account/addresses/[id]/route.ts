import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { addressInput } from "@/server/modules/account/account.schema";
import { deleteAddress, updateAddress } from "@/server/modules/account/account.service";

export const PUT = apiHandler(
  { auth: true, params: idParams, body: addressInput },
  async ({ user, params, body }) => ok(await updateAddress(user!.id, params.id, body)),
);

export const DELETE = apiHandler({ auth: true, params: idParams }, async ({ user, params }) => {
  await deleteAddress(user!.id, params.id);
  return ok(null);
});
