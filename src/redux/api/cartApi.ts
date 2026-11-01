import type { CartView } from "@/server/modules/cart/cart.service";
import { baseApi } from "./baseApi";

const CART = { type: "Cart" as const, id: "CURRENT" };

// Every mutation answers with the fresh cart. Item changes write it straight into the cache, so a
// quick second click on − / + builds on the new quantity instead of the not-yet-refetched one.
// CART is still invalidated so the checkout preview follows.
const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<CartView, void>({
      query: () => ({ url: "/cart" }),
      providesTags: [CART],
    }),
    addCartItem: build.mutation<CartView, { variantId: string; quantity: number }>({
      query: (data) => ({ url: "/cart/items", method: "POST", data }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const cart = await queryFulfilled.then((r) => r.data).catch(() => null);
        if (cart) dispatch(cartApi.util.upsertQueryData("getCart", undefined, cart));
      },
      invalidatesTags: [CART],
    }),
    setCartQuantity: build.mutation<CartView, { variantId: string; quantity: number }>({
      query: ({ variantId, quantity }) => ({
        url: `/cart/items/${variantId}`,
        method: "PATCH",
        data: { quantity },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const cart = await queryFulfilled.then((r) => r.data).catch(() => null);
        if (cart) dispatch(cartApi.util.upsertQueryData("getCart", undefined, cart));
      },
      invalidatesTags: [CART],
    }),
    removeCartItem: build.mutation<CartView, string>({
      query: (variantId) => ({ url: `/cart/items/${variantId}`, method: "DELETE" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const cart = await queryFulfilled.then((r) => r.data).catch(() => null);
        if (cart) dispatch(cartApi.util.upsertQueryData("getCart", undefined, cart));
      },
      invalidatesTags: [CART],
    }),
    applyCoupon: build.mutation<CartView, string>({
      query: (code) => ({ url: "/cart/coupon", method: "POST", data: { code } }),
      invalidatesTags: [CART],
    }),
    removeCoupon: build.mutation<CartView, void>({
      query: () => ({ url: "/cart/coupon", method: "DELETE" }),
      invalidatesTags: [CART],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useSetCartQuantityMutation,
  useRemoveCartItemMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} = cartApi;
