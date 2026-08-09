"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Persistent client-side wishlist.
 *
 * The wishlist is a pure browser affordance - a shopper can bookmark items
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
const EMPTY: WishlistItem[] = [];

function parseStorage(): WishlistItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    const cleaned = parsed.filter(
      (item): item is WishlistItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as WishlistItem).handle === "string",
    );
    return cleaned.length === 0 ? EMPTY : cleaned;
  } catch {
    return EMPTY;
  }
}

// External store, so we can drive the component via useSyncExternalStore
// instead of a setState-in-effect hydration dance (which the
// react-hooks/set-state-in-effect rule flags).
let cache: WishlistItem[] | null = null;
const subscribers = new Set<() => void>();

function getSnapshot(): WishlistItem[] {
  if (cache === null) cache = parseStorage();
  return cache;
}

function getServerSnapshot(): WishlistItem[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  subscribers.add(listener);
  // Sync across tabs.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = parseStorage();
    subscribers.forEach((fn) => fn());
  };
  if (subscribers.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    subscribers.delete(listener);
    if (subscribers.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function write(next: WishlistItem[]) {
  cache = next.length === 0 ? EMPTY : next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      // Storage full or blocked - the in-memory list still works for the tab.
    }
  }
  subscribers.forEach((fn) => fn());
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const has = useCallback(
    (handle: string) => items.some((item) => item.handle === handle),
    [items],
  );

  const add = useCallback((item: WishlistItem) => {
    const current = getSnapshot();
    if (current.some((existing) => existing.handle === item.handle)) return;
    write([...current, item]);
  }, []);

  const remove = useCallback((handle: string) => {
    write(getSnapshot().filter((item) => item.handle !== handle));
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    const current = getSnapshot();
    const exists = current.some((existing) => existing.handle === item.handle);
    write(
      exists
        ? current.filter((existing) => existing.handle !== item.handle)
        : [...current, item],
    );
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

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
