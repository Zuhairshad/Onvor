import type { CatalogProduct } from "@/lib/content/catalog";

/**
 * Collection filtering.
 *
 * Facets are colour (option Shopify tracks per product) and price (bucketed
 * server-side against the product's minimum variant price). Only facets with
 * more than one relevant value are shown, so a colour filter that would
 * collapse the grid to nothing never appears.
 *
 * State lives in the query string so a filtered view is linkable, survives a
 * reload, and is filtered on the server rather than hidden with CSS.
 */
export const FACET_KEYS = ["category", "color", "price"] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

/** Colour is the only Shopify option we facet on; the rest is derived. */
const COLOR_OPTION = "Color";

/** Fixed PKR price buckets. */
type Bucket = { key: string; label: string; min: number; max: number | null };
const PRICE_BUCKETS: Bucket[] = [
  { key: "u2000", label: "Under Rs. 2,000", min: 0, max: 2000 },
  { key: "2000-4000", label: "Rs. 2,000 - Rs. 4,000", min: 2000, max: 4000 },
  { key: "4000-6000", label: "Rs. 4,000 - Rs. 6,000", min: 4000, max: 6000 },
  { key: "6000+", label: "Rs. 6,000 and above", min: 6000, max: null },
];

export type Facet = {
  key: FacetKey;
  label: string;
  values: string[];
  /** Human-readable label for each value, keyed by value. */
  labels?: Record<string, string>;
};

export type Filters = Record<FacetKey, string[]>;

export const EMPTY_FILTERS: Filters = { category: [], color: [], price: [] };

function bucketFor(price: number): Bucket | undefined {
  return PRICE_BUCKETS.find(
    (bucket) => price >= bucket.min && (bucket.max === null || price < bucket.max),
  );
}

/** The facets worth showing for a set of products: present, and not the only choice. */
export function facetsFor(products: CatalogProduct[]): Facet[] {
  const categories = new Set<string>();
  const colours = new Set<string>();
  const bucketsHit = new Set<string>();

  for (const product of products) {
    if (product.type) categories.add(product.type);
    for (const value of product.options[COLOR_OPTION] ?? []) colours.add(value);
    const bucket = bucketFor(Number(product.price));
    if (bucket) bucketsHit.add(bucket.key);
  }

  const categoryFacet: Facet = {
    key: "category",
    label: "Category",
    values: [...categories].sort((a, b) => a.localeCompare(b)),
  };

  const colourFacet: Facet = {
    key: "color",
    label: "Colour",
    values: [...colours].sort((a, b) => a.localeCompare(b)),
  };

  const priceFacet: Facet = {
    key: "price",
    label: "Price",
    values: PRICE_BUCKETS.filter((bucket) => bucketsHit.has(bucket.key)).map((bucket) => bucket.key),
    labels: Object.fromEntries(PRICE_BUCKETS.map((bucket) => [bucket.key, bucket.label])),
  };

  return [categoryFacet, colourFacet, priceFacet].filter((facet) => facet.values.length > 1);
}

/** Reads `?color=Black&price=u2000,2000-4000` into a filter set. */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
  available: Facet[],
): Filters {
  const filters: Filters = { category: [], color: [], price: [] };
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
  return FACET_KEYS.reduce((total, key) => total + (filters?.[key]?.length ?? 0), 0);
}

/**
 * A product matches when every *active* facet has at least one of its selected
 * values - union within a facet, intersection across facets.
 */
export function applyFilters(products: CatalogProduct[], filters: Filters): CatalogProduct[] {
  if (countActive(filters) === 0) return products;

  return products.filter((product) => {
    const selectedCategories = filters?.category ?? [];
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.type)) return false;

    const selectedColours = filters?.color ?? [];
    if (selectedColours.length > 0) {
      const colours = product.options[COLOR_OPTION] ?? [];
      if (!selectedColours.some((value) => colours.includes(value))) return false;
    }

    const selectedBuckets = filters?.price ?? [];
    if (selectedBuckets.length > 0) {
      const bucket = bucketFor(Number(product.price));
      if (!bucket || !selectedBuckets.includes(bucket.key)) return false;
    }

    return true;
  });
}
