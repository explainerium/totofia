import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { listQuery } from "@/server/modules/catalog/shared.schema";
import { listSubscribers } from "@/server/modules/content/inbox.service";

export const GET = apiHandler({ admin: true, query: listQuery }, async ({ query }) => {
  const { items, meta } = await listSubscribers(query);
  return ok(items, { meta });
});
