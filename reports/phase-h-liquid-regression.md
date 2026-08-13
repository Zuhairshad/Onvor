# Phase H — Liquid vs Headless Regression Report

- Date: 2026-08-10
- Liquid storefront: https://theonvor.com
- Headless (Next.js) preview: https://onvor.vercel.app
- Method: Read-only `curl -sL -A "Mozilla/5.0 Phase-H-regression-bot"` fetches (plus one iPhone UA sweep). No POSTs, no cart writes, no checkout navigation, no cookies persisted. All raw HTML captured under `reports/evidence/phase-h/`.

Every visible price/URL below is derived from the on-disk evidence, not from a live re-fetch during report generation. All cart-key / checkout-token patterns were scanned for and none were present, so nothing needed redaction.

---

## 1. Overall match rate

| Bucket | Checked | Match | Partial | Mismatch |
|---|---|---|---|---|
| Homepage reachability | 2 | 2 | 0 | 0 |
| Product PDPs (5 handles × 2 sites) | 10 | 10 | 0 | 0 |
| PDP price parity (5 products) | 5 | 5 | 0 | 0 |
| Collection listing reachability | 2 routes × 2 sites | 3 | 0 | 1 (`/collections/all` on headless is 404) |
| Cart route reachability | 2 | 2 | 0 | 0 |
| Homepage metadata (title/desc/canonical) | 3 fields × 2 sites | 2 | 2 | 2 |
| PDP metadata (title/desc/canonical) | 3 fields × 2 sites | 2 | 2 | 2 |
| Mobile UA reachability | 2 | 2 | 0 | 0 |

Aggregate: ~85% of behaviors match; the misses cluster in **SEO metadata (canonical URL)** and **the `/collections/all` route mapping**.

---

## 2. Comparison table

| Area | Liquid (theonvor.com) | Headless (onvor.vercel.app) | Match? | Notes |
|---|---|---|---|---|
| `/` HTTP status | 200 | 200 | Yes | |
| `/` title | `ONVOR` | `Onvor - unisex cotton basics` | No | Intentional rebrand-style title on headless; more descriptive but not identical. |
| `/` meta description | not emitted | `We believe good clothes should be simple. ONVOR creates unisex basics that work from gym to life. Quality you can feel.` | Headless-only | Headless adds a description; Liquid theme does not render one on `/`. |
| `/` canonical | `https://theonvor.com/` | `https://theonvor.com` | No | Missing trailing slash; also headless PDPs/collections point canonical to root — see defect H-2. |
| Nav — collection links present in server HTML | Yes (Home, Shop Now, category links, Loose Fit Tees, Baggy Trouser, Straight Fit Trouser, Pleated Trousers, Shorts, Trousers, etc.) | Yes (Men, Women, Tops, Bottoms, Loose Fit Tees, Baggy Trouser, Straight Fit Trouser, Pleated Trousers, Shorts, All Products, Shop the sale, etc.) | Mostly | Headless nav is richer/re-organized (Men/Women mega-menu split, Sustainability, Garment Care, Lookbook, Size Guide, Customer Care). Liquid nav is flatter. Both link to the same underlying `/collections/*` handles. Intended difference. |
| Nav — `/collections/all` link | Present as "Continue shopping" fallback | Not linked; replaced by `/collections/all-products` ("Shop all", "View all", "Continue shopping") | No | Regression (defect H-1). |
| Footer — policies | Contact, plus theme footer | `/policies/contact-information`, `/policies/shipping-policy`, `/policies/refund-policy`, `/policies/privacy-policy`, `/policies/terms-of-service` | Yes | Both surface Shopify policies. Headless additionally links `/pages/sustainability`, `/pages/garment-care`, `/pages/customer-care`, `/pages/lookbook`, `/pages/size-guide`. |
| `/collections/all` HTTP status | 200 (17 product tiles rendered server-side) | **404** (`__next_error__` shell, `noindex`) | **No** | Defect H-1 (High). |
| `/collections/all-products` HTTP status | 200 | 200 | Yes | Both populated. |
| `/collections/all-products` product count in initial HTML | 17 | 63 | Partial | Different backing collections. Liquid's `all-products` collection appears to be curated (17 hand-picked items); headless surfaces a larger catalog set. Product overlap is real but not 1-to-1. See defect H-3. |
| `/collections/all-products` title | `All Products – ONVOR` | `All Products \| Onvor` | Yes | Semantically identical. |
| `/collections/all-products` canonical | `https://theonvor.com/collections/all-products` | `https://theonvor.com` | No | Defect H-2. |
| PDP `stamp-tee-black` — HTTP status | 200 | 200 | Yes | |
| PDP `stamp-tee-black` — visible price | Rs.1,679.30 sale / Rs.2,399.00 compare-at | Rs 1,679 sale / Rs 2,399 compare-at | Yes (see note) | Headless drops the `.30` paisa in the visible label but the JSON-LD `price` is `1679.3` PKR — same amount, same currency. |
| PDP `signature-straight-fit-black` — visible price | Rs.2,379.30 / Rs.3,399.00 | Rs 2,379 / Rs 3,399 | Yes | Same amount. |
| PDP `navy-wildflower-tee` — visible price | Rs.1,749.30 / Rs.2,499.00 | Rs 1,749 / Rs 2,499 | Yes | Same amount. |
| PDP `signature-shorts-charcoal` — visible price | Rs.1,959.30 / Rs.2,799.00 | Rs 1,959 / Rs 2,799 | Yes | Same amount. |
| PDP `blue-sunset-escape-tee` — visible price | Rs.1,749.30 / Rs.2,499.00 | Rs 1,749 / Rs 2,499 | Yes | Same amount. |
| PDP `stamp-tee-black` — title | `Stamp Tee - Black – ONVOR` | `Stamp Tee - Black \| Onvor` | Yes | Separator style differs; content matches. |
| PDP `stamp-tee-black` — meta description | Long Liquid-templated blurb starting `Soft. Loose fit. All-day wear…` | Short `Stamp Tee - Black - Oversized T-shirt cut for a loose unisex fit.` | Partial | Not launch-blocking, but headless PDP descriptions are noticeably shorter and generic. See defect H-4. |
| PDP `stamp-tee-black` — canonical | `https://theonvor.com/products/stamp-tee-black` | `https://theonvor.com` | No | Defect H-2. |
| `/cart` HTTP status | 200 (empty cart state) | 200 (empty cart state) | Yes | |
| `/cart` checkout host reference (server HTML) | `theonvor.com` (147 mentions), Shopify's `checkouts/internal/preloads.js`, `shopify-accelerated-checkout-cart` — checkout is under `theonvor.com` | Zero literal `checkout` string in server-rendered HTML (SPA/client-rendered "Continue shopping" empty state) | Partial | Neither page exposes a raw checkout URL for an empty cart. Liquid ships the Shopify Buy Now / Shop Pay scaffolding upfront; headless defers the checkout link generation to the client-side cart drawer. **Cannot verify from HTML alone that headless posts to `theonvor.com`.** See defect H-5. |
| Mobile UA `/` (Liquid) | 200, 584,989 bytes, title `ONVOR` | — | Yes | |
| Mobile UA `/` (Headless) | — | 200, 253,611 bytes, title `Onvor - unisex cotton basics` | Yes | Server responds identically to the iPhone UA. |

---

## 3. Defect list

| ID | Severity | Area | Description |
|---|---|---|---|
| H-1 | **High** | Routing / SEO | `https://onvor.vercel.app/collections/all` returns HTTP 404 with a `<html id="__next_error__">` shell and `<meta name="robots" content="noindex">`. Liquid serves it 200 with 17 products. Any inbound link, sitemap entry, or historic backlink pointing to `/collections/all` will 404 on the headless site the moment DNS cuts over. |
| H-2 | **High** | SEO | Every headless page emits `<link rel="canonical" href="https://theonvor.com">` (bare root) regardless of the actual URL. Verified on `/`, `/products/stamp-tee-black`, and `/collections/all-products`. Google will consolidate all page equity onto the homepage and drop PDPs from the index. Launch-blocker for SEO. |
| H-3 | Medium | Merchandising | `/collections/all-products` on Liquid renders 17 products; on Headless it renders 63. This is not a rendering bug — the two sites are pulling from differently configured Shopify collections. Confirm with merchandising whether the headless "63" is correct; if Liquid's curated 17 is the intent, the headless build needs to filter to the same collection ruleset (or vice-versa). |
| H-4 | Low | Metadata | Headless PDP `<meta name="description">` is a short generic sentence (`"…Oversized T-shirt cut for a loose unisex fit."`). Liquid emits the full Shopify product-metafield description. Headless is losing SERP snippet quality. |
| H-5 | Medium | Cart / checkout wiring | Headless `/cart` returns 200 with no server-rendered checkout URL — the checkout button is entirely client-rendered by the cart drawer. That's expected for an SPA cart, but it means **we cannot confirm from Phase-H's read-only vantage point that the "Checkout" button routes to `checkout.theonvor.com` / `theonvor.com`**. Manual (or a Phase-I browser-based) verification of the JS-rendered checkout href is required before launch. |
| H-6 | Low | Content parity | Homepage `<title>` differs (`ONVOR` vs `Onvor - unisex cotton basics`). Not a bug per se; flag for brand review — the headless title is more SEO-friendly, but confirm marketing signed off on the copy change. |

No P0/launch-blocking rendering, price, or availability regressions were found. Prices and product availability are consistent across all 5 sampled PDPs; the launch-blockers are all SEO/routing artifacts (H-1, H-2) and one unverifiable checkout-wiring path (H-5).

---

## 4. Intended differences vs regressions

### Intended (do not fix before launch)
- **Nav structure.** Headless splits Men/Women into full mega-menus with pages (Sustainability, Garment Care, Lookbook, Size Guide, Customer Care) that Liquid does not surface. Consistent with the headless redesign brief.
- **Homepage title copy.** `Onvor - unisex cotton basics` on headless vs bare `ONVOR` on Liquid — assumed to be a deliberate brand-copy change. Flag for confirmation (H-6) but treat as intended.
- **Homepage meta description.** Liquid emits none; headless adds one. Improvement, not regression.
- **Visible price decimals.** Headless shows `Rs 1,679`; Liquid shows `Rs.1,679.30`. Underlying JSON-LD price is `1679.3` PKR in both cases. Product cost is identical — this is a currency-format choice on the headless side. Confirm with merchandising that rounding-in-display is acceptable given cents are still real (the checkout will charge the full 1,679.30).
- **Cart / empty-state UX.** Both show empty cart; headless is SPA-rendered, Liquid is server-rendered. Different implementation, same user outcome.
- **Product-count difference on `/collections/all-products` (H-3).** Likely intended (headless was built against a broader catalog), but needs a merch signoff. Flagging as Medium because if unintended, category pages will misrepresent inventory.

### Regressions (fix before launch)
- **H-1**: `/collections/all` → 404 on headless. Add a redirect to `/collections/all-products`, or (better) implement `/collections/all` as an alias route so both handles resolve.
- **H-2**: Canonical URL is hard-coded to `https://theonvor.com`. Every page needs a per-route canonical (`https://theonvor.com${pathname}`).
- **H-4**: PDP meta descriptions should hydrate from the Shopify product body / SEO metafields, not a static fallback template.
- **H-5**: Confirm the client-rendered cart's "Checkout" href resolves to `theonvor.com` / `checkout.theonvor.com` before cutover.

---

## 5. Evidence index

All raw HTML captured under `/Users/shad/Onvor/reports/evidence/phase-h/`:

- `liquid-home.html`, `headless-home.html`
- `liquid-home-mobile.html`, `headless-home-mobile.html` (iPhone UA)
- `liquid-collections-all.html` (200, 17 tiles), `headless-collections-all.html` (**404 error shell**)
- `liquid-all-products.html`, `headless-all-products.html`
- `liquid-cart.html`, `headless-cart.html`
- `liquid-pdp-<handle>.html` and `headless-pdp-<handle>.html` for handles: `stamp-tee-black`, `signature-straight-fit-black`, `navy-wildflower-tee`, `signature-shorts-charcoal`, `blue-sunset-escape-tee`

No cookies were persisted; no cart keys or checkout tokens appeared in the captured HTML (a `grep` for `?key=` and `checkout_token=` returned zero matches, so nothing required redaction).

---

## 6. Launch recommendation

**Do not launch until H-1 and H-2 are resolved.** Both are cheap fixes and both directly damage SEO the moment DNS cuts to the headless origin. H-5 needs at minimum a manual (Phase-I / browser) verification pass. H-3, H-4, H-6 are all launch-permissible with product/marketing sign-off.

---

## 7. Release-candidate re-verification (2026-08-10)

A dedicated release-candidate preview was deployed via `vercel deploy` (no `--prod`, no git push):

- Preview URL: `https://onvor-2la0c43ml-zuhairshads-projects.vercel.app`
- Deployment id: `dpl_EFYjNNaDKevAvq1zGDseqGqodjec`
- Target: `null` (preview — production alias `onvor.vercel.app` NOT touched)
- Corresponds to local `HEAD = ad39bd9` (chain: `ad39bd9 fix(routes): redirect legacy all-products collection` → `a1b6293 chore(lint): resolve storefront lint violations` → `b407160 fix(seo): add route-specific canonicals and homepage heading` → `abb2318 …`)

**H-1 (single 308 for `/collections/all`) — CLOSED**

- `curl -sI https://onvor-2la0c43ml…/collections/all` → `HTTP/2 308` with `location: /collections/all-products`. One hop.
- `curl -sIL` chain: `308 → 200`. No loop, no chain.
- Destination `/collections/all-products` → `HTTP/2 200`, 63 product links in server HTML (matches Phase H count for this collection).
- Other redirects (`/blogs/news`, `/blogs/:path*`) unchanged.

**H-2 (per-route self-canonical) — CLOSED**

Verified on every indexable route type; no route resolves to the bare root any more:

| Route | Canonical on RC preview |
|---|---|
| `/` | `https://onvor.vercel.app` |
| `/products/stamp-tee-black` | `https://onvor.vercel.app/products/stamp-tee-black` |
| `/products/signature-straight-fit-black` | `https://onvor.vercel.app/products/signature-straight-fit-black` |
| `/collections/all-products` | `https://onvor.vercel.app/collections/all-products` |
| `/collections/oversized-tees` | `https://onvor.vercel.app/collections/oversized-tees` |
| `/pages/sustainability` | `https://onvor.vercel.app/pages/sustainability` |
| `/pages/size-guide` | `https://onvor.vercel.app/pages/size-guide` |
| `/pages/lookbook` | `https://onvor.vercel.app/pages/lookbook` |
| `/pages/contact` | `https://onvor.vercel.app/pages/contact` |
| `/pages/customer-care` | `https://onvor.vercel.app/pages/customer-care` |
| `/pages/garment-care` | `https://onvor.vercel.app/pages/garment-care` |
| `/policies/privacy-policy` | `https://onvor.vercel.app/policies/privacy-policy` |

Canonicals resolve against `NEXT_PUBLIC_SITE_URL=https://onvor.vercel.app` on this preview. At cutover the env value will flip to the live production origin and canonicals will re-target accordingly.

**H-5 (checkout wiring) — CLOSED** by the Phase D instrumented run against `onvor.vercel.app`, re-confirmed against the RC preview by a second Puppeteer run: `/cart` renders two `<a>` elements (desktop + mobile-sticky) with `hostname === "theonvor.com"`; navigating that URL produces exactly one 302 to `theonvor.com/checkouts/cn/[REDACTED-TOKEN]/en-pk`. See `reports/phase-d-checkout-report.md` → "Instrumented checkout observation" and `reports/evidence/phase-d/08-instrumented-checkout-rc.json`.

**H1 audit across 12 sampled routes — all count=1, meaningful:**

`/` → `Onvor — unisex cotton basics`; `/products/*` → product title; `/collections/*` → collection title; `/pages/*` → page title; `/policies/privacy-policy` → `Privacy Policy`; `/cart` → `Your bag`; `/search` → `Search`.

**Price parity spot-check (RC vs Liquid):** Same amount, different encoding.

| Handle | Liquid inline `price` (paise) | RC inline `price` (PKR decimal) |
|---|---|---|
| stamp-tee-black | 167930 | 1679.3 |
| signature-straight-fit-black | 237930 | 2379.3 |
| navy-wildflower-tee | 174930 | 1749.3 |
| signature-shorts-charcoal | 195930 | 1959.3 |
| blue-sunset-escape-tee | 174930 | 1749.3 |

**Runtime error surface on RC** (Puppeteer, fresh isolated profile, `08-instrumented-checkout-rc.json`):

| Signal | Baseline (`07-*`) | RC (`08-*`) |
|---|---|---|
| Console errors | 1 (Shopify `private_access_tokens` 401) | 0 |
| Console warnings | 0 | 0 |
| Page errors | 1 (puppeteer navigation-timeout, not a page error) | 1 (same puppeteer artifact) |
| Failed requests | 4 (all Shopify analytics/pixel aborts) | 3 (all preview-side aborts caused by tab navigating to hosted checkout) |
| HTTP ≥400 | 1 (Shopify `private_access_tokens` 401) | **0** |

No new console/page/network/server errors introduced. Both runs show the same puppeteer navigation-timeout artifact (the Shopify checkout SPA never satisfies `networkidle2` because analytics polling stays open).

---

## 8. H-3 catalog-difference investigation (2026-08-10)

**Finding: H-3 is a FALSE REGRESSION — closed with no code change required.**

Method (all read-only, no writes, no cookies persisted):

1. `curl https://theonvor.com/collections/all/products.json?limit=250` → 63 products, `published_at` populated on every entry.
2. `curl https://theonvor.com/collections/all-products/products.json?limit=250` → 63 products, identical set.
3. `curl https://theonvor.com/products.json?limit=250` (Shopify's public "Online Store" catalog export — only returns products published to the Online Store sales channel) → 63 products, identical set.
4. Re-read the captured Liquid HTML for `/collections/all` and `/collections/all-products`: both contain literal pagination markup — `page=2`, `of 63`, `of 5`. The "17" observed earlier was page-1 of a 5-page paginate loop, not a filtered catalog.
5. Handle-set diff between Liquid (`products.json`) and RC-preview headless (`/collections/all-products` HTML): `diff` returns byte-identical apart from a trailing newline. **63 handles = 63 handles, exact same handles.**

Catalog audit against the same JSON:

| Attribute | Value |
|---|---|
| Published (Online Store) | 63 / 63 |
| Vendor | Onvor (63 / 63) |
| Draft / archived / hidden / test / wholesale / staff / b2b in handle | 0 |
| Products with zero available variants | 0 |
| Product types | Oversized T-shirt 35, Bottoms 11, Baggy Trousers 9, shorts 6, Pleated Trouser 2 |
| Tags found | `Loose Fit Tees`, `men`, `am_2 july`, `women`, `Pleated Trouser`, `Trouser`, `bottoms` (no wholesale/hidden/draft markers) |

**Root cause of the earlier discrepancy:** Liquid's default theme paginates collection pages (17/page on the current theme, 5 pages). The headless build renders the whole collection in one server response (no client pagination). Both sources are the same 63 products; the "17 vs 63" was an artefact of counting rendered tiles on page 1 rather than counting the catalog.

**Sales-channel scope:** `products.json` on Shopify Online Store returns only products published to the Online Store sales channel, so the 63 count is authoritative for what a shopper can reach through either storefront. Nothing draft/archived/hidden is exposed. No handle contains suspicious substrings.

**Is `/collections/all-products` the correct equivalent of Liquid `/collections/all`?** For the shopper: yes — both surface the same 63 published products in the same order (Storefront default `MANUAL/COLLECTION_DEFAULT`). H-1's 308 redirect from `/collections/all` → `/collections/all-products` therefore lands the visitor on a page containing every product the Liquid `/collections/all` route would have paginated through.

**Residual caveat requiring owner confirmation (Admin API not authorised):** the `products.json` public endpoint cannot see products that are `draft`/`archived` (they're excluded by Shopify by design). If the owner has any product they intentionally hid from the Online Store sales channel but wants surfaced via the headless build (or vice-versa), that would only be visible via Admin API. **Marking H-3 as `OWNER SIGN-OFF REQUIRED BEFORE LAUNCH`**: owner must confirm "the 63 published products are the complete intended catalogue" — text confirmation, no config change needed.

Reclassification:

| ID | Was | Now |
|---|---|---|
| H-3 | Medium / merchandising | **False regression — technical parity confirmed. OWNER SIGN-OFF REQUIRED (Admin-verifiable catalogue-intent statement only).** |

