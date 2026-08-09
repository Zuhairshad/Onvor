"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Persistent client-side wishlist.
 *
 * The wishlist is a pure browser affordance — a shopper can bookmark items
 * without an account, and the list survives refreshes via localStorage. We
 * store enough per item (title / image / price) that the /wishlist route can
 * render instantly without a Storefront round-trip.
 */
export type WishlistItem = {
  handle: string;
  title: string;
  price: string;
  compareAt?: string | null;
  image?: string | null;
};

type State = {
  items: WishlistItem[];
  count: number;
  has: (handle: string) => boolean;
  add: (item: WishlistItem) => void;
  remove: (handle: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
};

const WishlistCtx = createContext<State | null>(null);

const STORAGE_KEY = "onvor-wishlist";

function readFromStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is WishlistItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as WishlistItem).handle === "string",
    );
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount. Kept out of initial state so SSR and
  // the first client render match — the empty [] before hydration matches what
  // the server produced.
  useEffect(() => {
    setItems(readFromStorage());
    setHydrated(true);
  }, []);

  // Persist any change once hydrated. The gate stops the first render from
  // clobbering a real stored list with an empty one.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked — the in-memory list still works for the tab.
    }
  }, [items, hydrated]);

  const has = useCallback(
    (handle: string) => items.some((item) => item.handle === handle),
    [items],
  );

  const add = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((existing) => existing.handle === item.handle)
        ? prev
        : [...prev, item],
    );
  }, []);

  const remove = useCallback((handle: string) => {
    setItems((prev) => prev.filter((item) => item.handle !== handle));
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((existing) => existing.handle === item.handle)
        ? prev.filter((existing) => existing.handle !== item.handle)
        : [...prev, item],
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<State>(
    () => ({ items, count: items.length, has, add, remove, toggle, clear }),
    [items, has, add, remove, toggle, clear],
  );

  return <WishlistCtx.Provider value={value}>{children}</WishlistCtx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistCtx);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
