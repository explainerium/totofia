import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { pageInput } from "@/server/modules/content/content.schema";
import { deletePage, getPage, updatePage } from "@/server/modules/content/page.service";

export const GET = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await getPage(params.id)),
);

export const PUT = apiHandler(
  { admin: true, params: idParams, body: pageInput },
  async ({ params, body }) => ok(await updatePage(params.id, body)),
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deletePage(params.id);
  return ok(null);
});
