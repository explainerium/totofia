import type { CategoryInput } from "@/server/modules/category/category.schema";
import type { AdminCategory } from "@/server/modules/category/category.service";
import { baseApi } from "./baseApi";

const LIST = { type: "Category" as const, id: "LIST" };

const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<AdminCategory[], void>({
      query: () => ({ url: "/admin/categories" }),
      providesTags: [LIST],
    }),
    getCategory: build.query<AdminCategory, string>({
      query: (id) => ({ url: `/admin/categories/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Category", id }],
    }),
    createCategory: build.mutation<AdminCategory, CategoryInput>({
      query: (data) => ({ url: "/admin/categories", method: "POST", data }),
      invalidatesTags: [LIST],
    }),
    updateCategory: build.mutation<AdminCategory, { id: string; data: CategoryInput }>({
      query: ({ id, data }) => ({ url: `/admin/categories/${id}`, method: "PUT", data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Category", id }, LIST],
    }),
    deleteCategory: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, "Product"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
