import type { CatalogProduct } from "@/lib/content/catalog";

/**
 * Collection filtering.
 *
 * Facets are derived from the catalog rather than declared, so a collection only
 * ever offers values it actually contains — a size filter that returns nothing is
 * worse than no size filter. Onvor's products carry two option names at most
 * (Size and Color), so those are the facets; anything else Shopify adds later
 * appears automatically.
 *
 * State lives in the query string so a filtered view is linkable, survives a
 * reload, and is filtered on the server rather than hidden with CSS.
 */
export const FACET_KEYS = ["size", "color"] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

/** Query-string key -> the option name Shopify uses on the product. */
const OPTION_NAME: Record<FacetKey, string> = { size: "Size", color: "Color" };

export type Facet = {
  key: FacetKey;
  label: string;
  values: string[];
};

export type Filters = Record<FacetKey, string[]>;

export const EMPTY_FILTERS: Filters = { size: [], color: [] };

/** Sizes read in a fixed order; anything unrecognised falls to the end, sorted. */
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];

function bySize(a: string, b: string) {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

/** The facets worth showing for a set of products: present, and not the only choice. */
export function facetsFor(products: CatalogProduct[]): Facet[] {
  return FACET_KEYS.map((key) => {
    const name = OPTION_NAME[key];
    const values = new Set<string>();
    for (const product of products) {
      for (const value of product.options[name] ?? []) values.add(value);
    }
    const sorted = [...values].sort(key === "size" ? bySize : (a, b) => a.localeCompare(b));
    return { key, label: name === "Color" ? "Colour" : name, values: sorted };
  }).filter((facet) => facet.values.length > 1);
}

/** Reads `?size=S,M&color=Black` into a filter set, dropping anything unknown. */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
  available: Facet[],
): Filters {
  const filters: Filters = { size: [], color: [] };
  for (const facet of available) {
    const raw = searchParams[facet.key];
    const value = Array.isArray(raw) ? raw.join(",") : raw;
    if (!value) continue;
    filters[facet.key] = value
      .split(",")
      .map((part) => part.trim())
      .filter((part) => facet.values.includes(part));
  }
  return filters;
}

export function countActive(filters: Filters): number {
  return FACET_KEYS.reduce((total, key) => total + filters[key].length, 0);
}

/**
 * A product matches when every *active* facet has at least one of its selected
 * values — union within a facet, intersection across facets, which is what
 * shoppers expect from "Black or Grey, in M".
 */
export function applyFilters(products: CatalogProduct[], filters: Filters): CatalogProduct[] {
  if (countActive(filters) === 0) return products;

  return products.filter((product) =>
    FACET_KEYS.every((key) => {
      const selected = filters[key];
      if (selected.length === 0) return true;
      const values = product.options[OPTION_NAME[key]] ?? [];
      return selected.some((value) => values.includes(value));
    }),
  );
}
