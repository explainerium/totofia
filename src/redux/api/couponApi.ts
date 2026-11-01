import type { CouponAdminInput } from "@/server/modules/coupon/coupon.schema";
import type { AdminCoupon } from "@/server/modules/coupon/coupon.service";
import { baseApi } from "./baseApi";

const LIST = { type: "Coupon" as const, id: "LIST" };

const couponApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCoupons: build.query<AdminCoupon[], void>({
      query: () => ({ url: "/admin/coupons" }),
      providesTags: [LIST],
    }),
    createCoupon: build.mutation<AdminCoupon, CouponAdminInput>({
      query: (data) => ({ url: "/admin/coupons", method: "POST", data }),
      invalidatesTags: [LIST],
    }),
    updateCoupon: build.mutation<AdminCoupon, { id: string; data: CouponAdminInput }>({
      query: ({ id, data }) => ({ url: `/admin/coupons/${id}`, method: "PUT", data }),
      invalidatesTags: [LIST],
    }),
    deleteCoupon: build.mutation<{ deactivated: boolean }, string>({
      query: (id) => ({ url: `/admin/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
