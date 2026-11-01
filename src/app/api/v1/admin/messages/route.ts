import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { listQuery } from "@/server/modules/catalog/shared.schema";
import { listContactMessages } from "@/server/modules/content/inbox.service";

const query = listQuery.extend({
  status: z.enum(["INBOX", "NEW", "READ", "ARCHIVED"]).optional(),
});

export const GET = apiHandler({ admin: true, query }, async ({ query }) => {
  const { items, meta, unread } = await listContactMessages(query);
  return ok({ items, unread }, { meta });
});
