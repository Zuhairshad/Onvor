"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SelectionContextValue = {
  selected: Record<string, string>;
  setSelected: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  isCurrentVariantAvailable: boolean;
};

const ProductSelectionContext = createContext<SelectionContextValue | null>(null);

export function ProductSelectionProvider({
  children,
  initialSelected,
  variantAvailability,
  productAvailable,
}: {
  children: ReactNode;
  initialSelected: Record<string, string>;
  variantAvailability: Record<string, boolean>;
  productAvailable: boolean;
}) {
  const [selected, setSelected] = useState<Record<string, string>>(initialSelected);

  const isCurrentVariantAvailable = useMemo(() => {
    const key = Object.entries(selected)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
    return variantAvailability[key] ?? productAvailable;
  }, [selected, variantAvailability, productAvailable]);

  return (
    <ProductSelectionContext.Provider value={{ selected, setSelected, isCurrentVariantAvailable }}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection(): SelectionContextValue {
  const ctx = useContext(ProductSelectionContext);
  if (!ctx) throw new Error("useProductSelection must be used within ProductSelectionProvider");
  return ctx;
}

/** Null-safe variant for components that can run with or without the provider. */
export function useProductSelectionOptional(): SelectionContextValue | null {
  return useContext(ProductSelectionContext);
}
