import type { ApiMeta } from "@/lib/api/axios";
import type {
  ManualOrderInput,
  StatusChangeInput,
} from "@/server/modules/order/order-admin.schema";
import type { AdminOrder, AdminOrderListItem } from "@/server/modules/order/order.service";
import type { listPayments } from "@/server/modules/payment/payment.service";
import { baseApi } from "./baseApi";

export type OrderPayment = Awaited<ReturnType<typeof listPayments>>[number];

export type OrderListParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: AdminOrderListItem["status"];
};

type OrderList = { items: AdminOrderListItem[]; meta?: ApiMeta };

const LIST = { type: "Order" as const, id: "LIST" };
// Status changes move stock and money: refresh products, coupons and the dashboard too.
const SIDE_EFFECTS = ["Product", "Coupon", "Dashboard", "Customer"] as const;

const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrderList, OrderListParams>({
      query: (params) => ({ url: "/admin/orders", params }),
      transformResponse: (items: AdminOrderListItem[], meta) => ({
        items,
        meta: meta?.pagination,
      }),
      providesTags: [LIST],
    }),
    getOrder: build.query<AdminOrder, string>({
      query: (id) => ({ url: `/admin/orders/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
    createManualOrder: build.mutation<{ id: string; number: number }, ManualOrderInput>({
      query: (data) => ({ url: "/admin/orders", method: "POST", data }),
      invalidatesTags: [LIST, ...SIDE_EFFECTS],
    }),
    changeOrderStatus: build.mutation<AdminOrder, { id: string; data: StatusChangeInput }>({
      query: ({ id, data }) => ({ url: `/admin/orders/${id}/status`, method: "PATCH", data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }, LIST, ...SIDE_EFFECTS],
    }),
    addOrderNote: build.mutation<AdminOrder, { id: string; body: string }>({
      query: ({ id, body }) => ({
        url: `/admin/orders/${id}/notes`,
        method: "POST",
        data: { body },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }],
    }),
    setPaymentStatus: build.mutation<
      AdminOrder,
      { id: string; paymentStatus: AdminOrder["paymentStatus"] }
    >({
      query: ({ id, paymentStatus }) => ({
        url: `/admin/orders/${id}/payment`,
        method: "PATCH",
        data: { paymentStatus },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }, LIST, "Dashboard"],
    }),
    getOrderPayments: build.query<OrderPayment[], string>({
      query: (id) => ({ url: `/admin/orders/${id}/payments` }),
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
    /** Re-check the gateway for a payment whose IPN may have been missed. */
    recheckOrderPayment: build.mutation<{ paid: boolean; payments: OrderPayment[] }, string>({
      query: (id) => ({ url: `/admin/orders/${id}/payments`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Order", id }, LIST, "Dashboard"],
    }),
  }),
});

export const {
  useGetOrderPaymentsQuery,
  useRecheckOrderPaymentMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateManualOrderMutation,
  useChangeOrderStatusMutation,
  useAddOrderNoteMutation,
  useSetPaymentStatusMutation,
} = orderApi;
