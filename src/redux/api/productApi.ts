import type { ApiMeta } from "@/lib/api/axios";
import type { ProductInput } from "@/server/modules/product/product.schema";
import type { AdminProduct, AdminProductListItem } from "@/server/modules/product/product.service";
import { baseApi } from "./baseApi";

export type ProductListParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: AdminProduct["status"];
  categoryId?: string;
};

type ProductList = { items: AdminProductListItem[]; meta?: ApiMeta };

const LIST = { type: "Product" as const, id: "LIST" };
const CATEGORIES = { type: "Category" as const, id: "LIST" };

const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<ProductList, ProductListParams>({
      query: (params) => ({ url: "/admin/products", params }),
      transformResponse: (items: AdminProductListItem[], meta) => ({
        items,
        meta: meta?.pagination,
      }),
      providesTags: [LIST],
    }),
    getProduct: build.query<AdminProduct, string>({
      query: (id) => ({ url: `/admin/products/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),
    createProduct: build.mutation<AdminProduct, ProductInput>({
      query: (data) => ({ url: "/admin/products", method: "POST", data }),
      invalidatesTags: [LIST, CATEGORIES],
    }),
    updateProduct: build.mutation<AdminProduct, { id: string; data: ProductInput }>({
      query: ({ id, data }) => ({ url: `/admin/products/${id}`, method: "PUT", data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Product", id }, LIST, CATEGORIES],
    }),
    deleteProduct: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, CATEGORIES],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
