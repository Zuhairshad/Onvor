import { cacheLife, cacheTag } from "next/cache";

import { flatten, storefront } from "./client";
import {
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_HANDLES_QUERY,
  GET_COLLECTION_QUERY,
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_HANDLES_QUERY,
  GET_PRODUCT_QUERY,
} from "./queries";
import { collectionTag, productTag, TAGS } from "./tags";
import type {
  Collection,
  CollectionProductSortKey,
  CollectionWithProducts,
  Image,
  Product,
  ProductSortKey,
  ProductVariant,
} from "./types";

type Connection<T> = {
  edges: Array<{ node: T }>;
  pageInfo?: { hasNextPage: boolean; endCursor: string | null };
};

/** The wire shape: connections where the app wants arrays. */
type RawProduct = Omit<Product, "images" | "variants"> & {
  images: Connection<Image>;
  variants: Connection<ProductVariant>;
};

function normalizeProduct(raw: RawProduct): Product {
  return {
    ...raw,
    images: flatten(raw.images),
    variants: flatten(raw.variants),
  };
}

export type ProductListOptions = {
  first?: number;
  after?: string;
  /** Shopify search syntax, e.g. `tag:new AND available_for_sale:true`. */
  query?: string;
  sortKey?: ProductSortKey;
  reverse?: boolean;
};

export type Paginated<T> = {
  items: T[];
  hasNextPage: boolean;
  endCursor: string | null;
};

export async function getProduct(handle: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products, productTag(handle));

  const data = await storefront<{ product: RawProduct | null }, { handle: string }>({
    query: GET_PRODUCT_QUERY,
    variables: { handle },
  });

  return data.product ? normalizeProduct(data.product) : null;
}

export async function getProducts(
  options: ProductListOptions = {},
): Promise<Paginated<Product>> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);

  const { first = 24, after, query, sortKey = "BEST_SELLING", reverse = false } = options;

  const data = await storefront<{ products: Connection<RawProduct> }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first, after, query, sortKey, reverse },
  });

  return {
    items: flatten(data.products).map(normalizeProduct),
    hasNextPage: data.products.pageInfo?.hasNextPage ?? false,
    endCursor: data.products.pageInfo?.endCursor ?? null,
  };
}

export type CollectionOptions = Omit<ProductListOptions, "query" | "sortKey"> & {
  sortKey?: CollectionProductSortKey;
};

export async function getCollection(
  handle: string,
  options: CollectionOptions = {},
): Promise<CollectionWithProducts | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.collections, collectionTag(handle), TAGS.products);

  const { first = 24, after, sortKey = "COLLECTION_DEFAULT", reverse = false } = options;

  const data = await storefront<{
    collection: (Collection & { products: Connection<RawProduct> }) | null;
  }>({
    query: GET_COLLECTION_QUERY,
    variables: { handle, first, after, sortKey, reverse },
  });

  if (!data.collection) return null;

  const { products, ...collection } = data.collection;
  return {
    ...collection,
    products: flatten(products).map(normalizeProduct),
  };
}

export async function getCollections(first = 50): Promise<Collection[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.collections);

  const data = await storefront<{ collections: Connection<Collection> }>({
    query: GET_COLLECTIONS_QUERY,
    variables: { first },
  });

  return flatten(data.collections);
}

type HandleNode = { handle: string; updatedAt: string };

async function allHandles(query: string, key: "products" | "collections"): Promise<HandleNode[]> {
  const handles: HandleNode[] = [];
  let after: string | null = null;

  // Shopify caps `first` at 250 per page; walk the whole connection.
  for (;;) {
    const data: Record<string, Connection<HandleNode>> = await storefront<
      Record<string, Connection<HandleNode>>
    >({
      query,
      variables: { first: 250, after },
    });

    const connection = data[key];
    handles.push(...flatten(connection));

    if (!connection.pageInfo?.hasNextPage) break;
    after = connection.pageInfo.endCursor;
    if (!after) break;
  }

  return handles;
}

/** For generateStaticParams and the sitemap. */
export async function getProductHandles(): Promise<HandleNode[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);

  return allHandles(GET_PRODUCT_HANDLES_QUERY, "products");
}

export async function getCollectionHandles(): Promise<HandleNode[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.collections);

  return allHandles(GET_COLLECTION_HANDLES_QUERY, "collections");
}
