import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { unsubscribe } from "@/server/modules/content/inbox.service";

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await unsubscribe(params.id);
  return ok(null);
});
