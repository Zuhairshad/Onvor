"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getCartSummary } from "@/app/actions/cart";
import type { Cart } from "@/lib/shopify";

/**
 * Client-side mirror of the current cart.
 *
 * The header badge and the mini-cart drawer both need cart state that updates
 * the instant a mutation resolves — cookie-driven server components can't do
 * that without a full round-trip. Server actions that mutate the cart return
 * the fresh `Cart`; callers hand it back here via `setCart` so the mirror
 * stays authoritative without a second network hop.
 */
type State = {
  cart: Cart | null;
  count: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setCart: (cart: Cart | null) => void;
  /** Force a re-fetch — used when a mutation happens outside our own actions. */
  refresh: () => Promise<void>;
};

const CartCtx = createContext<State | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    const next = await getCartSummary();
    setCart(next);
  }, []);

  // Prime the cart once on mount. The setState happens in the fetch resolver,
  // not synchronously in the effect body — the header renders fine at count 0
  // and the badge just appears when the fetch resolves.
  useEffect(() => {
    let cancelled = false;
    getCartSummary().then((next) => {
      if (!cancelled) setCart(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CartCtx.Provider
      value={{
        cart,
        count: cart?.totalQuantity ?? 0,
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        setCart,
        refresh,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
