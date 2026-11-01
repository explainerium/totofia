import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { contactStatusInput } from "@/server/modules/content/content.schema";
import { deleteContactMessage, setContactStatus } from "@/server/modules/content/inbox.service";

export const PATCH = apiHandler(
  { admin: true, params: idParams, body: contactStatusInput },
  async ({ params, body }) => {
    await setContactStatus(params.id, body.status);
    return ok(null);
  },
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deleteContactMessage(params.id);
  return ok(null);
});
