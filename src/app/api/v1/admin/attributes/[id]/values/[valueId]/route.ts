import { apiHandler } from "@/server/http/api-handler";
import { valueParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { attributeValueInput } from "@/server/modules/attribute/attribute.schema";
import {
  deleteAttributeValue,
  updateAttributeValue,
} from "@/server/modules/attribute/attribute.service";

export const PUT = apiHandler(
  { admin: true, params: valueParams, body: attributeValueInput },
  async ({ params, body }) => ok(await updateAttributeValue(params.id, params.valueId, body)),
);

export const DELETE = apiHandler({ admin: true, params: valueParams }, async ({ params }) =>
  ok(await deleteAttributeValue(params.id, params.valueId)),
);
