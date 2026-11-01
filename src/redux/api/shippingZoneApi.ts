import type { ShippingZoneInput } from "@/server/modules/shipping/shipping.schema";
import type { ShippingZone } from "@/server/modules/shipping/shipping.service";
import { baseApi } from "./baseApi";

const LIST = { type: "ShippingZone" as const, id: "LIST" };

const shippingZoneApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getShippingZones: build.query<ShippingZone[], void>({
      query: () => ({ url: "/admin/shipping-zones" }),
      providesTags: [LIST],
    }),
    createShippingZone: build.mutation<ShippingZone, ShippingZoneInput>({
      query: (data) => ({ url: "/admin/shipping-zones", method: "POST", data }),
      invalidatesTags: [LIST],
    }),
    updateShippingZone: build.mutation<ShippingZone, { id: string; data: ShippingZoneInput }>({
      query: ({ id, data }) => ({ url: `/admin/shipping-zones/${id}`, method: "PUT", data }),
      invalidatesTags: [LIST],
    }),
    deleteShippingZone: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/shipping-zones/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
} = shippingZoneApi;
