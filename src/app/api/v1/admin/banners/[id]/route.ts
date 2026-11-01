import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { bannerInput } from "@/server/modules/content/content.schema";
import { deleteBanner, updateBanner } from "@/server/modules/content/banner.service";

export const PUT = apiHandler(
  { admin: true, params: idParams, body: bannerInput },
  async ({ params, body }) => ok(await updateBanner(params.id, body)),
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deleteBanner(params.id);
  return ok(null);
});
