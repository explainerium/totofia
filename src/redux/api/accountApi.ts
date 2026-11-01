import type { SessionUser } from "@/server/auth/session";
import type { AddressInput, ProfileInput } from "@/server/modules/account/account.schema";
import type { SavedAddress } from "@/server/modules/account/account.service";
import { baseApi } from "./baseApi";

const ME = { type: "Account" as const, id: "ME" };
const ADDRESSES = { type: "Account" as const, id: "ADDRESSES" };

export type Me = { user: SessionUser; addresses: SavedAddress[] } | null;

const accountApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<Me, void>({
      query: () => ({ url: "/account/me" }),
      providesTags: [ME, ADDRESSES],
    }),
    getAddresses: build.query<SavedAddress[], void>({
      query: () => ({ url: "/account/addresses" }),
      providesTags: [ADDRESSES],
    }),
    createAddress: build.mutation<SavedAddress, AddressInput>({
      query: (data) => ({ url: "/account/addresses", method: "POST", data }),
      invalidatesTags: [ADDRESSES],
    }),
    updateAddress: build.mutation<SavedAddress, { id: string; data: AddressInput }>({
      query: ({ id, data }) => ({ url: `/account/addresses/${id}`, method: "PUT", data }),
      invalidatesTags: [ADDRESSES],
    }),
    deleteAddress: build.mutation<null, string>({
      query: (id) => ({ url: `/account/addresses/${id}`, method: "DELETE" }),
      invalidatesTags: [ADDRESSES],
    }),
    updateProfile: build.mutation<unknown, ProfileInput>({
      query: (data) => ({ url: "/account/profile", method: "PATCH", data }),
      invalidatesTags: [ME],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useUpdateProfileMutation,
} = accountApi;
