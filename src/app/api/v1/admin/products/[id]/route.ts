import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { productInput } from "@/server/modules/product/product.schema";
import {
  deleteProduct,
  getAdminProduct,
  updateProduct,
} from "@/server/modules/product/product.service";

export const GET = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await getAdminProduct(params.id)),
);

export const PUT = apiHandler(
  { admin: true, params: idParams, body: productInput },
  async ({ params, body }) => ok(await updateProduct(params.id, body)),
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deleteProduct(params.id);
  return ok(null);
});
