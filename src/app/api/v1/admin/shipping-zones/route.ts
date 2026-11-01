import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { shippingZoneInput } from "@/server/modules/shipping/shipping.schema";
import { createZone, listZones } from "@/server/modules/shipping/shipping.service";

export const GET = apiHandler({ admin: true }, async () => ok(await listZones()));

export const POST = apiHandler({ admin: true, body: shippingZoneInput }, async ({ body }) =>
  ok(await createZone(body), { status: 201 }),
);
