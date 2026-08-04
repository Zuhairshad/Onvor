/**
 * Cache tags for catalog data. Paired with `cacheTag()` inside `use cache`
 * scopes and with `revalidateTag()` in the Shopify webhook handler, so a
 * product edit in the admin invalidates exactly the reads that depend on it.
 */
export const TAGS = {
  products: "shopify:products",
  collections: "shopify:collections",
  pages: "shopify:pages",
} as const;

export function productTag(handle: string) {
  return `shopify:product:${handle}`;
}

export function collectionTag(handle: string) {
  return `shopify:collection:${handle}`;
}
