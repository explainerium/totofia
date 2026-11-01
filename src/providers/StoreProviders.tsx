"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { CartDrawerProvider } from "@/components/storefront/cart/CartDrawerContext";
import { makeStore } from "@/redux/store";

/** Storefront client state: RTK Query cache (cart, wishlist, checkout) and the cart drawer. */
export function StoreProviders({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  return (
    <Provider store={store}>
      <CartDrawerProvider>{children}</CartDrawerProvider>
    </Provider>
  );
}
