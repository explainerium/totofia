import { ApiError } from "@/server/http/api-error";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { gatewaySettingsInput } from "@/server/modules/payment/gateway-settings.schema";
import {
  getGatewaySettingsForAdmin,
  updateGatewaySettings,
} from "@/server/modules/payment/gateway-settings.service";

// Gateway credentials: ADMIN only (STAFF cannot see or change them).
export const GET = apiHandler({ admin: true }, async ({ user }) => {
  if (user!.role !== "ADMIN") throw new ApiError(403, "forbidden");
  return ok(await getGatewaySettingsForAdmin());
});

export const PUT = apiHandler(
  { admin: true, body: gatewaySettingsInput },
  async ({ body, user }) => {
    if (user!.role !== "ADMIN") throw new ApiError(403, "forbidden");
    return ok(await updateGatewaySettings(body));
  },
);
