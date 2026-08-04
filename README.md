# Onvor

Headless Shopify storefront on Next.js 16 (App Router), TypeScript and Tailwind CSS v4.
Shopify owns the catalog, cart, checkout, payments and orders; this app is the
storefront that reads from the Storefront API.

Storefront UI is not built yet — it comes from the supplied design. What's here is
the data layer, caching and revalidation plumbing that the UI will sit on.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the Shopify values
npm run dev
```

### Shopify credentials

1. Shopify admin → **Settings → Apps and sales channels → Develop apps → Create an app**.
2. **Configuration → Storefront API**, grant at least:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory` (needed for `quantityAvailable`)
   - `unauthenticated_write_checkouts` and `unauthenticated_read_checkouts` (cart)
3. Install the app, then copy the **Storefront API access token** into
   `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
4. Set `SHOPIFY_STORE_DOMAIN` to your `*.myshopify.com` domain.

`SHOPIFY_API_VERSION` is pinned to `2026-07`. Shopify ships a new version each
quarter and supports each for ~12 months; bump it deliberately and re-run the
checks below.

## Architecture

| Concern | Location |
| --- | --- |
| GraphQL transport, error handling | `src/lib/shopify/client.ts` |
| Fragments / queries / mutations | `src/lib/shopify/{fragments,queries,mutations}.ts` |
| Cached catalog reads | `src/lib/shopify/catalog.ts` |
| Per-visitor cart reads/writes | `src/lib/shopify/cart.ts` |
| Cart server actions | `src/app/actions/cart.ts` |
| Cache tags | `src/lib/shopify/tags.ts` |
| Webhook revalidation | `src/app/api/webhooks/shopify/route.ts` |

### Caching

`cacheComponents` is enabled in `next.config.ts`, so the app uses Partial
Prerendering. The split that matters:

- **Catalog reads are cached.** Every function in `catalog.ts` opens with
  `"use cache"`, sets `cacheLife("hours")`, and tags itself via `cacheTag`. They
  are shared across all visitors and land in the static shell.
- **Cart reads are not cached.** `cart.ts` reads the cart-id cookie, so caching it
  would serve one shopper's cart to another. Render cart UI inside `<Suspense>`
  so the rest of the route still prerenders.

Adding a page: fetch catalog data directly (it's cached), and put anything
cart- or cookie-dependent behind its own `<Suspense>` boundary.

### Revalidation

Point these Shopify webhook topics at `https://<your-domain>/api/webhooks/shopify`:

```
products/create      products/update      products/delete
collections/create   collections/update   collections/delete
```

Put the webhook's signing secret in `SHOPIFY_WEBHOOK_SECRET`. The handler verifies
the HMAC over the raw request body and rejects anything unsigned, then calls
`revalidateTag(tag, "max")` — stale-while-revalidate, so shoppers keep getting a
cached page while the fresh one builds.

## GraphQL correctness

The documents in `queries.ts` and `mutations.ts` are plain strings with
hand-written types in `types.ts`. They were validated against the real `2026-07`
Storefront schema, which is published without auth:

```bash
curl -s -X POST https://shopify.dev/storefront-graphql-direct-proxy/2026-07 \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __schema { queryType { name } } }"}'
```

You can also run the documents without credentials against Shopify's public mock
store at `https://mock.shop/api`. Note that this endpoint does **not** follow the
`/api/<version>/graphql.json` shape that `shopifyConfig()` builds, so post to it
directly rather than via `SHOPIFY_STORE_DOMAIN`. Useful caveat: its cart is a stub —
it returns a fixed `totalQuantity` and ignores the quantity you send, so verify cart
*shape* there and cart *arithmetic* against a real store.

Two things to know about the fragment setup:

- Fragments hold **only** their own definition. `withFragments()` composes and
  dedupes them per document. A fragment that embedded its own dependencies would
  emit duplicate definitions the moment two of them met in one document, which
  GraphQL rejects.
- `ProductOption.optionValues` is used instead of the deprecated
  `ProductOption.values`, and `CartCost.totalTaxAmount` is deliberately not
  selected — Shopify no longer returns tax/duty there. Tax is shown at checkout.

If the query surface grows, swap the hand-written types for generated ones
(`@shopify/api-codegen-preset`) without changing call sites.

## Checks

```bash
npx next typegen && npx tsc --noEmit   # typegen first: PageProps/LayoutProps are generated
npx eslint
npm run build
```
