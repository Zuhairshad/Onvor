import { shopifyConfig } from "./config";

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
};

type FetchOptions<V> = {
  query: string;
  variables?: V;
  /**
   * Pass "no-store" for per-visitor reads (cart, customer). Catalog reads are
   * cached by the enclosing `use cache` scope, so they leave this unset.
   */
  cache?: RequestCache;
  /** Buyer country/language for Shopify's @inContext directive. */
  headers?: Record<string, string>;
};

export async function storefront<T, V = Record<string, unknown>>({
  query,
  variables,
  cache,
  headers,
}: FetchOptions<V>): Promise<T> {
  const { endpoint, accessToken } = shopifyConfig();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
    ...(cache ? { cache } : {}),
  });

  if (!response.ok) {
    throw new ShopifyError(
      `Storefront API returned ${response.status} ${response.statusText}`,
      response.status,
      await response.text().catch(() => undefined),
    );
  }

  const body = (await response.json()) as GraphQLResponse<T>;

  if (body.errors?.length) {
    throw new ShopifyError(
      body.errors.map((error) => error.message).join("; "),
      response.status,
      body.errors,
    );
  }

  if (!body.data) {
    throw new ShopifyError("Storefront API returned no data", response.status);
  }

  return body.data;
}

/** Shopify returns connections; the app wants arrays. */
export function flatten<T>(connection: { edges: Array<{ node: T }> } | null | undefined): T[] {
  return connection?.edges.map((edge) => edge.node) ?? [];
}
