import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { attributeInput } from "@/server/modules/attribute/attribute.schema";
import { deleteAttribute, updateAttribute } from "@/server/modules/attribute/attribute.service";

export const PUT = apiHandler(
  { admin: true, params: idParams, body: attributeInput },
  async ({ params, body }) => ok(await updateAttribute(params.id, body)),
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deleteAttribute(params.id);
  return ok(null);
});
