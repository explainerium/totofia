import type { ApiMeta } from "@/lib/api/axios";
import type {
  AdminCustomer,
  AdminCustomerListItem,
} from "@/server/modules/customer/customer.service";
import { baseApi } from "./baseApi";

export type CustomerListParams = {
  page?: number;
  limit?: number;
  q?: string;
  role?: AdminCustomer["role"];
};

type CustomerList = { items: AdminCustomerListItem[]; meta?: ApiMeta };

const LIST = { type: "Customer" as const, id: "LIST" };

const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<CustomerList, CustomerListParams>({
      query: (params) => ({ url: "/admin/customers", params }),
      transformResponse: (items: AdminCustomerListItem[], meta) => ({
        items,
        meta: meta?.pagination,
      }),
      providesTags: [LIST],
    }),
    getCustomer: build.query<AdminCustomer, string>({
      query: (id) => ({ url: `/admin/customers/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Customer", id }],
    }),
    setCustomerBanned: build.mutation<AdminCustomer, { id: string; banned: boolean }>({
      query: ({ id, banned }) => ({
        url: `/admin/customers/${id}/ban`,
        method: "PATCH",
        data: { banned },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Customer", id }, LIST],
    }),
    setCustomerRole: build.mutation<AdminCustomer, { id: string; role: AdminCustomer["role"] }>({
      query: ({ id, role }) => ({
        url: `/admin/customers/${id}/role`,
        method: "PATCH",
        data: { role },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Customer", id }, LIST],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useSetCustomerBannedMutation,
  useSetCustomerRoleMutation,
} = customerApi;
