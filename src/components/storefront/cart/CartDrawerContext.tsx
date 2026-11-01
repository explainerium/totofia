"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type CartDrawer = { open: boolean; setOpen: (open: boolean) => void };

const Context = createContext<CartDrawer | null>(null);

/** Lets any add-to-bag button open the header's cart drawer. */
export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCartDrawer(): CartDrawer {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useCartDrawer must be used inside StoreProviders");
  return ctx;
}
