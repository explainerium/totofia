import type { BannerInput, PageInput } from "@/server/modules/content/content.schema";
import type { AdminBanner } from "@/server/modules/content/banner.service";
import type { AdminPage } from "@/server/modules/content/page.service";
import { baseApi } from "./baseApi";

const PAGES = { type: "Page" as const, id: "LIST" };
const BANNERS = { type: "Banner" as const, id: "LIST" };

const contentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPages: build.query<AdminPage[], void>({
      query: () => ({ url: "/admin/pages" }),
      providesTags: [PAGES],
    }),
    getPage: build.query<AdminPage, string>({
      query: (id) => ({ url: `/admin/pages/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Page", id }],
    }),
    createPage: build.mutation<AdminPage, PageInput>({
      query: (data) => ({ url: "/admin/pages", method: "POST", data }),
      invalidatesTags: [PAGES],
    }),
    updatePage: build.mutation<AdminPage, { id: string; data: PageInput }>({
      query: ({ id, data }) => ({ url: `/admin/pages/${id}`, method: "PUT", data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Page", id }, PAGES],
    }),
    deletePage: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/pages/${id}`, method: "DELETE" }),
      invalidatesTags: [PAGES],
    }),
    getBanners: build.query<AdminBanner[], void>({
      query: () => ({ url: "/admin/banners" }),
      providesTags: [BANNERS],
    }),
    createBanner: build.mutation<AdminBanner, BannerInput>({
      query: (data) => ({ url: "/admin/banners", method: "POST", data }),
      invalidatesTags: [BANNERS],
    }),
    updateBanner: build.mutation<AdminBanner, { id: string; data: BannerInput }>({
      query: ({ id, data }) => ({ url: `/admin/banners/${id}`, method: "PUT", data }),
      invalidatesTags: [BANNERS],
    }),
    deleteBanner: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/banners/${id}`, method: "DELETE" }),
      invalidatesTags: [BANNERS],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = contentApi;
