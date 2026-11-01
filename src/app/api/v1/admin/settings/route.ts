import { ApiError } from "@/server/http/api-error";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { storeSettingsInput } from "@/server/modules/setting/setting.schema";
import { getStoreSettings, updateStoreSettings } from "@/server/modules/setting/setting.service";

export const GET = apiHandler({ admin: true }, async () => ok(await getStoreSettings()));

export const PUT = apiHandler({ admin: true, body: storeSettingsInput }, async ({ body, user }) => {
  if (user!.role !== "ADMIN") throw new ApiError(403, "forbidden");
  return ok(await updateStoreSettings(body));
});
