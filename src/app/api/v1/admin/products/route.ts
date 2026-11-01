import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { adminProductListQuery, productInput } from "@/server/modules/product/product.schema";
import { createProduct, listAdminProducts } from "@/server/modules/product/product.service";

export const GET = apiHandler({ admin: true, query: adminProductListQuery }, async ({ query }) => {
  const { items, meta } = await listAdminProducts(query);
  return ok(items, { meta });
});

export const POST = apiHandler({ admin: true, body: productInput }, async ({ body }) =>
  ok(await createProduct(body), { status: 201 }),
);
