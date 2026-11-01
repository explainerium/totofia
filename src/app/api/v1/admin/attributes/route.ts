import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { attributeInput } from "@/server/modules/attribute/attribute.schema";
import { createAttribute, listAttributes } from "@/server/modules/attribute/attribute.service";

export const GET = apiHandler({ admin: true }, async () => ok(await listAttributes()));

export const POST = apiHandler({ admin: true, body: attributeInput }, async ({ body }) =>
  ok(await createAttribute(body), { status: 201 }),
);
