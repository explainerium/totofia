import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { shippingZoneInput } from "@/server/modules/shipping/shipping.schema";
import { deleteZone, updateZone } from "@/server/modules/shipping/shipping.service";

export const PUT = apiHandler(
  { admin: true, params: idParams, body: shippingZoneInput },
  async ({ params, body }) => ok(await updateZone(params.id, body)),
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deleteZone(params.id);
  return ok(null);
});
