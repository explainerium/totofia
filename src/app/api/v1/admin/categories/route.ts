import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { categoryInput } from "@/server/modules/category/category.schema";
import { createCategory, listCategories } from "@/server/modules/category/category.service";

export const GET = apiHandler({ admin: true }, async () => ok(await listCategories()));

export const POST = apiHandler({ admin: true, body: categoryInput }, async ({ body }) =>
  ok(await createCategory(body), { status: 201 }),
);
