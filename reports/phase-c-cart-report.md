# Phase C — Restricted Cart Integration Test (Gate 1)

**Date:** 2026-08-10 (UTC 2026-08-09T23:17Z)
**Restrictions honored:** cart ops only, minimum qty (1→2→0), no checkout navigation, no customer info, no order, no forms
**API:** Shopify Storefront `2026-07`, endpoint `https://jtszju-ha.myshopify.com/api/2026-07/graphql.json`
**Product under test:** `stamp-tee-black` (variant Size L)
**Rationale for choice:** mid-inventory variant (15 units) on a product already reconciled in Phase B (price 1,679.30 PKR, compareAt 2,399.00 PKR)
**Script:** `reports/evidence/phase-c/run-cart-tests.sh`
**Raw JSON evidence:** `reports/evidence/phase-c/01-baseline.json` … `09-cart-invalid-variant.json`

## Product / variant details

| Field | Value |
|---|---|
| product id | `gid://shopify/Product/8879037612313` (from baseline) |
| variant id (Size L) | `gid://shopify/ProductVariant/52163534061849` |
| unit price | 1,679.30 PKR |
| currency | PKR |
| baseline quantityAvailable (L) | **15** |
| availableForSale (variant) | true |

## Cart lifecycle

| Step | Op | Result | Cart totalQuantity | Subtotal | Inventory L |
|---|---|---|---|---|---|
| 1 | baseline product read | PASS | – | – | 15 |
| 2 | `cartCreate` +1×L | PASS | 1 | 1,679.30 | – |
| 3 | inventory re-read | PASS | – | – | **15** (unchanged) |
| 4 | `cart(id)` read-back | PASS | 1 | 1,679.30 | – |
| 5 | `cartLinesUpdate` qty=2 | PASS | 2 | 3,358.60 | – |
| 6 | inventory re-read | PASS | – | – | **15** (unchanged) |
| 7 | `cartLinesRemove` | PASS | 0 | – | – |
| 8 | inventory final | PASS | – | – | **15** (unchanged) |
| 9 | invalid variantId (negative) | PASS | – | – | – |

**Subtotal arithmetic:** 1,679.30 × 2 = 3,358.60 → matches Shopify's reported subtotal exactly.
**Negative path (step 9):** `userErrors=[{message:"The merchandise with id gid://shopify/ProductVariant/9999999999999 does not exist."}]` — clean rejection.

## Cart ID (for enumeration / owner cleanup)

`gid://shopify/Cart/[REDACTED-CART-ID]?key=[REDACTED]`

Single abandoned cart created; per Shopify docs, unused carts self-expire in ~10 days.

## Checkout handoff surface (recorded, not exercised)

- `checkoutUrl` host: `theonvor.com` (Shopify's primary storefront domain for this shop hosts the customer-facing checkout, regardless of which storefront created the cart — this is Shopify's documented behavior).
- Consequence: the headless preview and the existing Liquid storefront hand shoppers off to the **same** live checkout at `theonvor.com`. This is confirming evidence — beyond header inspection — that both storefronts are backed by the same Shopify shop.
- **The checkoutUrl was NOT fetched, followed, or opened.** This is Phase D/Gate 2 material.

## Inventory reservation verification

Storefront-API cart mutations (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`) **do not** decrement or reserve `quantityAvailable`. Verified by 4 sequential inventory reads (baseline → after create → after qty-update → after remove) all returning **15** for variant L. Shopify only decrements inventory at order completion — this matches Shopify's documented behavior and is safe for repeated cart testing.

## Restrictions honored

- ✅ Cart operations only.
- ✅ Minimum quantities (1 unit → 2 units → 0 units).
- ✅ No Shopify checkout navigation (checkoutUrl recorded, not fetched).
- ✅ No customer information submitted.
- ✅ No order placed.
- ✅ No contact / newsletter forms touched.
- ✅ Product, variant id, expected price, inventory status, cart ID all recorded above.
- ✅ Inventory verified unchanged after every mutation.
- ✅ No unexpected Shopify mutation observed.

## Notes

The application also wraps these same mutations in `src/app/actions/cart.ts` (server actions) with cookie persistence via `onvor_cart_id` (httpOnly, 30-day maxAge). The direct-API path exercised here validates the underlying Storefront behavior; the app-layer cookie flow was not exercised because it requires a browser session and would generate additional abandoned carts. Both paths call the same 4 mutations.

The `cost.subtotalAmount` and `cost.totalAmount` fields returned identical values in every response, confirming the app's `formatMoney(cart.cost.subtotalAmount)` display on `/cart` is fed the same amount the checkout uses (subject to shipping / tax added later at checkout, which the app comment already flags).
