import { baseApi } from "./baseApi";

const WISHLIST = { type: "Wishlist" as const, id: "CURRENT" };

const wishlistApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<{ productIds: string[] }, void>({
      query: () => ({ url: "/wishlist" }),
      providesTags: [WISHLIST],
    }),
    toggleWishlist: build.mutation<{ saved: boolean; productIds: string[] }, string>({
      query: (productId) => ({ url: "/wishlist/toggle", method: "POST", data: { productId } }),
      async onQueryStarted(_productId, { dispatch, queryFulfilled }) {
        // A failed toggle is shown by the caller; an uncaught await here would surface as an
        // unhandled promise rejection.
        const data = await queryFulfilled.then((r) => r.data).catch(() => null);
        if (!data) return;
        dispatch(
          wishlistApi.util.upsertQueryData("getWishlist", undefined, {
            productIds: data.productIds,
          }),
        );
      },
    }),
  }),
});

export const { useGetWishlistQuery, useToggleWishlistMutation } = wishlistApi;
