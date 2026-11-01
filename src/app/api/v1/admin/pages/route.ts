import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { pageInput } from "@/server/modules/content/content.schema";
import { createPage, listPages } from "@/server/modules/content/page.service";

export const GET = apiHandler({ admin: true }, async () => ok(await listPages()));

export const POST = apiHandler({ admin: true, body: pageInput }, async ({ body }) =>
  ok(await createPage(body), { status: 201 }),
);
