"use server";

import { getProducts } from "@/lib/shopify";
import { toCatalogProducts } from "@/lib/shopify/adapters";
import type { CatalogProduct } from "@/lib/content/catalog";

/**
 * Storefront-backed product search used by the header search dialog and the
 * /search page. Kept as a server action rather than an API route so the
 * Storefront token stays server-side and both callers share one call site.
 */
export async function searchProducts(
  query: string,
  first = 20,
): Promise<CatalogProduct[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const { items } = await getProducts({ first, query: q, sortKey: "RELEVANCE" });
    return toCatalogProducts(items);
  } catch {
    return [];
  }
}
