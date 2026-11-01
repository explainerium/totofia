import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { categoryInput } from "@/server/modules/category/category.schema";
import {
  deleteCategory,
  getCategory,
  updateCategory,
} from "@/server/modules/category/category.service";

export const GET = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await getCategory(params.id)),
);

export const PUT = apiHandler(
  { admin: true, params: idParams, body: categoryInput },
  async ({ params, body }) => ok(await updateCategory(params.id, body)),
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deleteCategory(params.id);
  return ok(null);
});
