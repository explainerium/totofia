import type { reviewableProducts } from "@/server/modules/review/review.service";
import { baseApi } from "./baseApi";

export type ReviewableProduct = Awaited<ReturnType<typeof reviewableProducts>>[number];

const REVIEWABLE = { type: "Review" as const, id: "REVIEWABLE" };

const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReviewableProducts: build.query<ReviewableProduct[], void>({
      query: () => ({ url: "/reviews" }),
      providesTags: [REVIEWABLE],
    }),
    createReview: build.mutation<null, { productId: string; rating: number; body: string }>({
      query: (data) => ({ url: "/reviews", method: "POST", data }),
      invalidatesTags: [REVIEWABLE],
    }),
  }),
});

export const { useGetReviewableProductsQuery, useCreateReviewMutation } = reviewApi;
