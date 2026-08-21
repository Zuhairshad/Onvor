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
  /**
   * When true, forwards the incoming browser Cookie header to Shopify.
   * Use only for cart mutations (create / add / update) so Shopify can
   * correlate the cart with the visitor's _shopify_y / _shopify_s identity.
   * Never set on catalog reads — cookies are irrelevant there.
   */
  forwardCookies?: boolean;
};

export async function storefront<T, V = Record<string, unknown>>({
  query,
  variables,
  cache,
  headers,
  forwardCookies,
}: FetchOptions<V>): Promise<T> {
  const { endpoint, accessToken } = shopifyConfig();

  let cookieHeader: string | undefined;
  if (forwardCookies) {
    try {
      const { headers: getHeaders } = await import("next/headers");
      const incoming = await getHeaders();
      cookieHeader = incoming.get("cookie") ?? undefined;
    } catch {
      // headers() throws outside a request context (e.g. during static
      // generation or unit tests). Silently omit — identity correlation is
      // best-effort and never blocks the cart mutation itself.
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": accessToken,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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
