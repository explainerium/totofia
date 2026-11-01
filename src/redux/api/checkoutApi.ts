import type { CheckoutInput } from "@/server/modules/checkout/checkout.schema";
import type { CheckoutPreview } from "@/server/modules/checkout/checkout.service";
import type { trackOrder } from "@/server/modules/order/order.service";
import type { OnlineMethod } from "@/server/modules/payment/gateway-settings.schema";
import { baseApi } from "./baseApi";

export type TrackedOrder = Awaited<ReturnType<typeof trackOrder>>;

const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** POST, but read-only — modelled as a query so it refetches when the cart changes. */
    getCheckoutPreview: build.query<
      CheckoutPreview & { onlinePayment: boolean; onlineMethods: OnlineMethod[] },
      { district?: string; phone?: string }
    >({
      query: (data) => ({ url: "/checkout/preview", method: "POST", data }),
      providesTags: [{ type: "Cart", id: "CURRENT" }],
    }),
    placeOrder: build.mutation<
      { number: number; token: string; paymentUrl: string | null },
      CheckoutInput
    >({
      query: (data) => ({ url: "/checkout/place", method: "POST", data }),
      invalidatesTags: [{ type: "Cart", id: "CURRENT" }],
    }),
    /** Start (again) the online payment of an unpaid order → gateway page URL. */
    payOrder: build.mutation<{ paymentUrl: string }, { number: number; token: string }>({
      query: ({ number, token }) => ({
        url: `/orders/${number}/pay`,
        method: "POST",
        data: { token },
      }),
    }),
    trackOrder: build.mutation<TrackedOrder, { number: number; phone: string }>({
      query: (data) => ({ url: "/orders/track", method: "POST", data }),
    }),
  }),
});

export const {
  useGetCheckoutPreviewQuery,
  usePlaceOrderMutation,
  usePayOrderMutation,
  useTrackOrderMutation,
} = checkoutApi;
