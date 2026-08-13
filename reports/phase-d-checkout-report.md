# Phase D — Restricted Checkout Handoff (Gate 2)

**Date:** 2026-08-10 (UTC 2026-08-09T23:26–23:29Z)
**Restrictions honored:** fresh isolated browser context; one minimal cart (1 × Size L); navigate through the storefront's Checkout button target; inspect only visible pre-form state; **no customer info entered**, **no sign-in**, **no Shop Pay activation**, **no advance past the pre-form page**; inventory recheck before/after; every abandoned cart logged (single cart, self-expires ~10d).
**Storefront target:** `https://onvor.vercel.app` (headless preview)
**Shopify shop domain (asset origin):** `jtszju-ha.myshopify.com`
**Shop id (checkout DOM):** `99646538009`
**Browser:** headless Google Chrome (`--headless=new`), throwaway `--user-data-dir` (deleted on exit), window 1440×900. No prior session, no Shop Pay cookie, no auth token.
**Product under test:** `stamp-tee-black`, variant Size L (`gid://shopify/ProductVariant/52163534061849`), unit price 1,679.30 PKR
**Script:** `reports/evidence/phase-d/run-checkout-tests.sh`
**Evidence:** `01-baseline.json`, `02-cart-create.json`, `03-cart-page.html`, `04-inventory-pre-checkout.json`, `05-checkout-dom.html`, `05-chrome-stderr.log`, `06-inventory-post-checkout.json` (all sanitized in place)

## Overall result: **PASS**

The headless preview's Checkout button lands on the same hosted Shopify checkout that the live Liquid store uses, branded ONVOR, showing the correct product, quantity, subtotal and currency. No inventory movement, no accidental interaction, no auth session established.

## Handoff URL chain

| Step | Where | Host | Match? |
|---|---|---|---|
| `cartCreate.cart.checkoutUrl` (Storefront API) | Shopify | `theonvor.com` | expected |
| `/cart` page Checkout `<a>` href (headless preview) | Next.js RSC | `theonvor.com` | matches API value |
| Final URL after Chrome navigation | Shopify hosted checkout | `theonvor.com` (path `/checkouts/cn/[REDACTED-TOKEN]`) | matches |
| Checkout page asset origins | Shopify CDN + shop | `cdn.shopify.com`, `checkout.shopify.com`, `jtszju-ha.myshopify.com`, `pay.shopify.com` | expected — this is Shopify's canonical checkout host wiring |

The preview's `checkoutUrl` and the button rendered on `/cart` are byte-identical (same host, same path/token). The button does not silently rewrite the URL client-side.

## Pre-form visible checkout state (grep of DOM, no interaction)

| Item | Requirement | Observed | Result |
|---|---|---|---|
| Store / shop identity | ONVOR / `jtszju-ha.myshopify.com` | `<title>Checkout - ONVOR</title>`; `data-shop-id="99646538009"`; assets from `jtszju-ha.myshopify.com` | PASS |
| Product name | Stamp Tee - Black | `"title":"Stamp Tee - Black"` (2 mentions in DOM); visible `<p>Stamp Tee - Black</p>` | PASS |
| Variant id | `52163534061849` | present in inline JSON | PASS |
| Product image | `cdn.shopify.com/.../onvorblacktee1.png` | resolved via same CDN as PDP | PASS |
| Quantity | 1 | one line row, no duplicated Stamp Tee line row | PASS |
| Unit price | Rs 1,679.30 | `Rs&nbsp;1,679.30` line price | PASS |
| Subtotal (goods) | Rs 1,679.30 | matches `cart.cost.subtotalAmount` from API | PASS |
| Currency | PKR (Rs symbol) | `Rs` symbol; no USD/GBP fallback | PASS |
| Discount UI state | no active discount | `discountCodes: []` from API; `name="apply_discount"` field present but empty; no allocations | PASS |
| Checkout branding | Onvor | 4 branding hits in DOM incl. `<title>` | PASS |
| Return-to-store presence | link back to the merchant | Onvor breadcrumb present (no explicit "Return" text — Shopify's default checkout uses the store name/logo as the return affordance, which is present) | PASS (see note) |
| Duplicate lines? | 1 cart line total | `cart.lines` length = 1 (from API); one line row in DOM; the second "Stamp Tee - Black" mention on `/cart` is metadata inside the RSC payload, not a second line | PASS |
| Console errors (browser) | none page-level | Chrome stderr contains only installer/Crashpad/Rosetta warnings, no page-level JS errors surfaced by `--dump-dom` | PASS (see caveat) |
| Network errors | none | no failed-request markers in stderr | PASS (see caveat) |

**Note on return-to-store:** Shopify hosts the checkout at `theonvor.com/checkouts/...` and uses the storefront's logo/wordmark (top of page) as the "back" affordance rather than an explicit "Return to shop" text link. This is Shopify's default behavior for hosted checkout; no misbranding observed.

**Caveat on console/network errors:** `chrome --dump-dom` captures the DOM after the virtual-time budget but does **not** stream the DevTools Console feed. What we can observe is process-level stderr, which shows only Chrome installer/Rosetta noise. A full browser (Playwright/Puppeteer with `page.on('console')` and `page.on('requestfailed')`) is required to *conclusively* verify zero console/network errors. This caveat is closed by the instrumented run in §"Instrumented checkout observation" below.

## Instrumented checkout observation (Puppeteer, no repo changes)

Run at 2026-08-09T23:48Z. Tool: `puppeteer-core` installed in a throwaway dir at `/tmp/phase-d-tools/` (no changes to the app repo — no package.json, lockfile, or source edits). Driven by system Chrome (`/Applications/Google Chrome.app/...`) with a fresh Puppeteer profile (`fs.mkdtempSync('/tmp/phase-d-pptr-profile-')`) that is deleted at the end of the run. Cart cookie was set on the preview host only. Script: `/tmp/phase-d-tools/checkout-observe.js`. Evidence: `reports/evidence/phase-d/07-instrumented-checkout.json` (sanitized in place).

**Handshake trace**

- Preview `/cart` returned HTTP 200. Two checkout `<a>` elements were rendered (desktop button + sticky mobile button); both had `hostname === "theonvor.com"`, both hrefs pointed at `theonvor.com/cart/c/[REDACTED-TOKEN]?key=[REDACTED]&_s=[REDACTED]&_y=[REDACTED]`.
- Navigating to the API-returned `checkoutUrl` produced exactly **one redirect**:
  - `302 https://theonvor.com/cart/c/[REDACTED-TOKEN]?…` → `https://theonvor.com/checkouts/cn/[REDACTED-TOKEN]/en-pk?…`
- Final URL host: `theonvor.com`. `document.title = "Checkout - ONVOR"`.
- No third-party redirect, no chain hop to any unexpected domain, no cross-origin bounce to a stray Shopify shop.

**Client-side error surface**

| Signal | Count | Verdict |
|---|---|---|
| `pageerror` events (uncaught JS exceptions) | 0 (the one `pageErrors` entry is a puppeteer-side navigation-timeout, not a page-emitted error — see next section) | PASS |
| `console.error` messages | 1 | see analysis below |
| `console.warning` (as `warn` type) | 4 (all `preload but not used` for Shopify's own checkout CSS bundles) | PASS — Shopify-owned resources, not our storefront |
| Failed requests (`requestfailed`) | 4 | see analysis below |
| HTTP responses with status ≥ 400 | 1 | see analysis below |

**HTTP ≥400 / failed-request analysis** — none of the four failures are caused by the headless storefront; all originate from Shopify's own checkout page:

1. `GET https://theonvor.com/private_access_tokens?id=[REDACTED]&checkout_type=c1` → **401**. Shopify's checkout attempts to acquire an anonymous customer-account access token; a 401 is the documented response when the shopper is not signed in. The checkout continues to function without it. Standard behavior, not a defect.
2. `POST https://error-analytics-sessions-production.shopifysvc.com/observeonly` → `net::ERR_ABORTED`. Shopify's analytics beacon; aborted because puppeteer stopped the browser at the 45s cap while long-poll telemetry was still open.
3. `POST https://theonvor.com/api/collect` → `net::ERR_ABORTED`. Same reason (long-lived analytics beacon aborted on tab close).
4. `GET https://theonvor.com/web-pixels@…/sandbox/modern/checkouts/…/en-pk` → `net::ERR_ABORTED` (`document` resource type). Shopify Web Pixels sandbox iframe navigating when the tab was closed.

The single "pageError" entry is `navigation-timeout: 45000 ms exceeded` — this is a puppeteer-side signal that `waitUntil: 'networkidle2'` didn't settle within 45s. It did not settle because Shopify's checkout keeps analytics polls open indefinitely; the DOM had already loaded fully (title, product, subtotal all readable). Not a page-level error, not a headless-storefront defect.

**Pre-form visible state (DOM read only, no clicks, no typing)**

| Field | Value |
|---|---|
| `document.title` | `Checkout - ONVOR` |
| Email input present | `true` (form rendered — not touched) |
| Card input / iframe present | `false` (payment section not yet rendered pre-address) |
| Shop Pay UI visible | `false` (fresh profile leaked no wallet) |
| Apple Pay UI visible | `false` |
| Product name visible ("Stamp Tee") | `true` |
| Subtotal visible ("1,679.30") | `true` |
| Discount field present in pre-form view | `false` (the earlier `--dump-dom` capture saw `name="apply_discount"` in raw HTML; the SPA hides that control until email is entered — expected) |
| Onvor branding present | `true` |

**Conclusion for the instrumented observation:** No client-side JS exceptions, no headless-storefront-originated request failures, no cross-domain redirects, no wallet-session leakage. The one 401 and the three `ERR_ABORTED`s are all Shopify-owned endpoints exhibiting documented behavior for an unauthenticated abandoned tab. The `PASS with caveat` from the initial run is now upgraded to **PASS** on the browser-error criterion.

## Shipping & taxes

**NOT TESTED — no shipping address entered.** Shopify's pre-address view showed a placeholder "Rs 225.00 / Total Rs 1,904.30" pair in the DOM (visible as a default/estimated shipping row). Real shipping and tax are computed only after the customer enters an address, which the Gate-2 restrictions explicitly forbid. The `1,904.30 = 1,679.30 + 225.00` arithmetic checks out for that placeholder row, but should not be relied on as an actual delivery quote.

## Inventory reservation verification

| Read | Value |
|---|---|
| Baseline (before cart) | 15 |
| After cart create | 15 |
| Pre-checkout-navigation | 15 |
| Post-checkout-navigation | 15 |

Zero movement across the full cart-create → checkout-page-load cycle. Consistent with Shopify's documented behavior: hosted checkout only reserves/decrements inventory at order completion.

## Restrictions honored

- ✅ Fresh, isolated browser context (throwaway `mktemp -d` user-data-dir, deleted on script exit).
- ✅ Approved headless storefront target (`onvor.vercel.app`).
- ✅ One minimal cart, 1 unit of the same variant tested in Phase C.
- ✅ Navigation triggered by the storefront's actual `Checkout` handoff URL (same href the user would click).
- ✅ Opened hosted checkout page + created one abandoned checkout — as approved.
- ✅ Verified only visible pre-form state (product, variant, qty, image, price, subtotal, currency, discount UI, branding).
- ✅ **No customer information entered** (email, name, address, phone).
- ✅ **No sign-in / no Shop Pay activation / did not advance past the pre-form page.**
- ✅ Shipping / taxes marked NOT TESTED (would require an address).
- ✅ Inventory rechecked before AND after checkout navigation.
- ✅ URLs, tokens, cart keys, and checkout tokens redacted from all evidence in place.

## Evidence redaction summary

Full-file `perl -i -pe` passes redacted every occurrence of `?key=…`, `/checkouts/c[on]/<token>`, and `gid://shopify/Cart/<id>` across all evidence files. Residual-leak grep after redaction returned nothing.

## Data hygiene

One abandoned cart / abandoned checkout created (single cart id, redacted). Self-expires in ~10 days per Shopify's documented cart lifecycle. If earlier cleanup is desired, the owner can enumerate abandoned checkouts in Shopify Admin → Orders → Abandoned checkouts and delete.

## What Phase D does NOT close

- Real console/network-error verification requires a full browser (Playwright/Puppeteer). Marked PASS with caveat.
- Shipping cost, tax computation, address validation, and payment options are **NOT TESTED** — they sit behind Gate 3.
- Order placement, inventory decrement, fulfillment triggers, customer/email records, downstream automations — **NOT TESTED** — Gate 3.
