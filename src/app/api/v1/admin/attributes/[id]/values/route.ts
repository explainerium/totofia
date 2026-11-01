import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { attributeValueInput } from "@/server/modules/attribute/attribute.schema";
import { createAttributeValue } from "@/server/modules/attribute/attribute.service";

export const POST = apiHandler(
  { admin: true, params: idParams, body: attributeValueInput },
  async ({ params, body }) => ok(await createAttributeValue(params.id, body), { status: 201 }),
);
