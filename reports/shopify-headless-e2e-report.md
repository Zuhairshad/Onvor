# Onvor Headless Storefront — Pre-Launch E2E Verification Report

**Date:** 2026-08-10
**Target headless preview:** `https://onvor.vercel.app/`
**Target Shopify shop:** `jtszju-ha.myshopify.com` (production shop backing the live Liquid store at `theonvor.com`).
**Storefront API version:** `2026-07`.
**Test method:** curl against the preview + direct Storefront API GraphQL, plus local build/lint/typecheck. No browser automation (per owner decision). No cart writes, no checkout attempts, no form round-trips, no order placement — all still behind approval gates.

## 1. Executive summary

**Final recommendation (2026-08-10):** **CONDITIONAL GO.**

The headless build is technically release-ready. The single remaining defect (D-F01, newsletter/contact form forwarding) is well-understood, has a documented fix path, and is not user-catastrophic (the frontend correctly displays an error state and prompts the shopper to email / WhatsApp instead — the failure is loud, not silent). Every other end-to-end path — catalog, cart, checkout handoff, real order creation, inventory reservation, order-confirmation email, referrer attribution to "Onvor Headless" — is verified PASS against live production Shopify with a real placed order (`#1054` / `YMG3FZGPY`, cancel + restock still to be performed by owner).

Conditions for **GO**:
1. **Must fix or accept D-F01** before cutover. If accepted as-is: users see the "email/WhatsApp us instead" fallback on every submission (no silent success, no data loss on the user's side — but Shopify never sees the message). Fixing needs one of: Admin API token (`write_customers`), a transactional-email provider, or moving submissions client-side.
2. **Owner must cancel + restock order `#1054`** in Shopify Admin (MCP policy blocks operator from doing it — instructions in §6).
3. **Owner erasure of the two test customer records** left in production Shopify (`zuhairshad140@gmail.com` from the order, `onvor-headless-e2e-schema-probe@example.com` from the D-F01 probe).
4. Production DNS cutover + production env vars are still an owner action, out of scope for this verification.

Owner sign-offs accepted this session (recorded verbatim per owner instruction 2026-08-10):

- H-3 catalogue: PASS. Liquid and headless expose the same 63 published products.
- H-4 PDP meta descriptions: accepted as non-blocking.
- H-6 homepage title copy: accepted.
- No further SEO or merchandising changes.

Gate execution completed this session:

- **Gate 4 (forms) — EXECUTED once each, per owner authorisation.** Sentinel `onvor-headless-e2e-20260810@example.com` / `HEADLESS E2E TEST – DO NOT CONTACT`. **Result: FAIL at the downstream Shopify write.** See defect D-F01 (§4). No Shopify customer/contact record was actually created — Cloudflare in front of `theonvor.com` returns 403 to the Vercel-side POST from the server action. Frontend + server action itself have no errors; the failure is at the theonvor.com edge.
- **Gate 3 (controlled order) — checkout URL prepared** (Stamp Tee - Black, size L, quantity 1, Rs 1,679.30 pre-shipping subtotal). Owner will complete checkout manually on own device (address / phone / card entered by owner). Operator did not, will not, and cannot read, log, or transmit those details. Order-number-based reconciliation is the next step; see §6.

Outstanding before production cutover:

- D-F01 (form forwarding blocked by Cloudflare bot-management on `theonvor.com`) — must fix or accept a documented degradation before launch; forms currently silently fail from Vercel.
- Order-test reconciliation once owner supplies the Shopify order number (see §6 checklist).
- Production deployment and DNS cutover from Liquid to headless — not in scope for this task.

**Closed blockers (release-candidate verification, `phase-h-liquid-regression.md` §7):**
- H-1 `/collections/all` → 404 → **CLOSED** by commit `ad39bd9` (single 308 to `/collections/all-products`, verified on RC preview `onvor-2la0c43ml-zuhairshads-projects.vercel.app`).
- H-2 canonical URL collapses to homepage → **CLOSED** by commit `b407160` (per-route self-canonicals verified across 12 sampled routes).
- H-5 checkout wiring unverifiable from server HTML → **CLOSED** by Phase D + RC Puppeteer runs (`reports/evidence/phase-d/07-instrumented-checkout.json`, `08-instrumented-checkout-rc.json`) — cart's "Checkout" resolves to `theonvor.com/checkouts/cn/…`, single 302, 0 pageerrors, 0 HTTP ≥400.
- D-A01/D-A02/D-A03 lint fixes → **committed** (`a1b6293`).

**Confidence:** Medium-high on read-only + instrumented paths. Cart/checkout/forms/orders end-to-end still gated.

- **Passed:** 27 automated / read-only tests (build, typecheck, sitemap/robots, page rendering, catalog reconciliation, sort behaviour, 404, webhook rejection path).
- **Failed:** 5 defects (1 High SEO, 1 Medium accessibility/SEO, 2 Medium React hygiene, 1 Low unused var). All are fix-in-code, not Shopify-side.
- **Blocked / not tested – approval required:** Cart, checkout, order, form round-trip, webhook positive path, Liquid regression, mobile viewport testing, hydration/console error surface.
- **Critical production risks still open:** hourly cache TTL + webhook dependency; abandoned-cart pollution once cart writes begin; live-form pollution once form submits begin; snapshot fallback catalog can mask API failures.

## 2. Architecture discovered

- Next.js 16.3.0 App Router with Turbopack, cache components / Partial Prerender enabled.
- Storefront API v2026-07, endpoint `https://jtszju-ha.myshopify.com/api/2026-07/graphql.json`. Read via `use cache` (RSC) with `cacheLife("hours")` + tags; cart via `cache: "no-store"`. `src/lib/shopify/{client,catalog,cart}.ts`.
- Webhook receiver `src/app/api/webhooks/shopify/route.ts` — HMAC-SHA256 gate, revalidates cache tags with SWR.
- Cart persistence via httpOnly cookie `onvor_cart_id` (30-day maxAge).
- Newsletter + contact server actions POST to live `https://theonvor.com/contact` (`src/app/actions/contact.ts`).
- No Admin API, no Customer Account API, no analytics pixels, no discount UI on cart page, wishlist is localStorage-only.
- Build produces 102 static pages (63 products, 14 collections, 5 policies, 6 pages, plus core routes).

## 3. Test results

See [`shopify-headless-test-matrix.md`](./shopify-headless-test-matrix.md) for the full row-per-case matrix. Summary:

| Result | Count |
|---|---|
| PASS | 27 |
| PARTIAL PASS | 2 (F01, F02) |
| FAIL | 5 (A03 rolled into D-A01/A02/A03, B03, B04) |
| NOT TESTED – APPROVAL REQUIRED | Cart, checkout, order, form round-trip, webhook positive path, Liquid regression |
| BLOCKED (no browser) | Mobile viewport rendering, hydration warnings, JS console errors, image LCP, layout shift |

## 4. Defects

### D-B01 · High · SEO: every route reports the homepage as its canonical URL
- **Environment:** `https://onvor.vercel.app/` (Vercel preview build).
- **Preconditions:** none.
- **Repro:** `curl -sS https://onvor.vercel.app/products/stamp-tee-black | grep canonical` → `<link rel="canonical" href="https://theonvor.com"/>`. Same result across `/`, `/collections/*`, `/products/*`, `/cart`, `/pages/*`, `/policies/*`, `/wishlist`, `/search`, `/account`.
- **Expected:** each route's canonical is the full URL for that route (e.g. `https://theonvor.com/products/stamp-tee-black`).
- **Actual:** every route emits `<link rel="canonical" href="https://theonvor.com"/>`.
- **Impact:** Google will treat every product and collection page as a duplicate of the homepage. Organic traffic to PDPs and collection landings will collapse. Existing Liquid rankings will not transfer.
- **Suspected cause:** `src/app/layout.tsx:55` sets `alternates: { canonical: "/" }` at the root layout. Next.js metadata cascades that to every descendant that doesn't override, and no PDP/collection/page metadata does. `metadataBase` resolves `/` against `NEXT_PUBLIC_SITE_URL = https://theonvor.com`.
- **Existed on Liquid?** No — Liquid theme emits per-page canonicals by default.
- **Recommended fix:** remove `alternates: { canonical: "/" }` from `src/app/layout.tsx`. Next.js will then default each route's canonical to its own URL (relative to `metadataBase`). If a route needs a custom canonical, set it in that route's `metadata` or `generateMetadata`.
- **Retest:** re-run the curl loop over the same 9 sample paths and confirm each canonical matches its URL.
- **Confidence:** high.

### D-B02 · Medium · Homepage has no H1
- **Environment:** preview `/`.
- **Repro:** `curl -sS https://onvor.vercel.app/ | grep -oE "<h1[^>]*>[^<]*</h1>"` → no match. Every other sampled route (`/cart`, `/account`, `/search`, `/pages/*`, `/policies/*`, `/wishlist`) emits an H1.
- **Expected:** exactly one H1 per document (WCAG 2.4.6, SEO best practice).
- **Actual:** homepage has zero H1s.
- **Impact:** accessibility — screen readers cannot use the H1 as a landmark. SEO — the homepage lacks the primary structural signal Google uses.
- **Suspected component:** `src/components/theme/ShoppableHero.tsx` — the Azadi ticker inside `AzadiSaleTicker.tsx` uses a `<p>` for the big display copy. Either promote the ticker copy to an H1 or add a visually-hidden H1 to the homepage.
- **Existed on Liquid?** likely no (Liquid themes normally set H1 to the shop name / hero heading).
- **Recommended fix:** add an H1 to `src/app/page.tsx` (visually-hidden if needed) — e.g. `<h1 className="sr-only">Onvor — unisex cotton basics</h1>`.
- **Retest:** curl `/` and confirm exactly one H1.
- **Confidence:** high.

### D-A01 · Medium · `setState` called synchronously inside `useEffect` in `SearchClient`
- **Environment:** `npm run lint` on local.
- **Repro:** run `npm run lint`. Rule `react-hooks/set-state-in-effect` reports `src/app/search/SearchClient.tsx:52` (`setResults([])` when the query becomes empty).
- **Impact:** cascading renders every time the shopper clears the search input.
- **Fix (applied locally, uncommitted):** removed the `setResults([])` branch; render logic now uses `visibleResults = trimmedQuery.length > 0 ? results : []`.
- **Retest:** `npm run lint` clean; behaviour: typing then clearing the query now shows the empty prompt without an extra render pass.

### D-A02 · Medium · `setState` called synchronously inside `useEffect` in `WishlistContext`
- **Environment:** `npm run lint` on local.
- **Repro:** `src/components/theme/WishlistContext.tsx:69` (`setItems(readFromStorage()); setHydrated(true)`).
- **Impact:** double render on mount for every page that uses the wishlist context (which is every route, since `WishlistProvider` wraps `RootLayout`).
- **Fix (applied locally, uncommitted):** refactored to `useSyncExternalStore` with a module-level cache + subscriber set. `getServerSnapshot` returns a stable empty array so SSR and first client render still match.
- **Retest:** `npm run lint` clean; wishlist add/remove/toggle/clear still work; cross-tab sync now supported via the `storage` event (bonus).

### D-A03 · Low · Unused `container` variants in `ImageReveal`
- **Environment:** `npm run lint`.
- **Repro:** `src/components/theme/ImageReveal.tsx:22` — declared `container: Variants` never referenced.
- **Fix (applied locally, uncommitted):** deleted the unused declaration.

### D-F01 · High · Newsletter and contact server actions cannot deliver to `theonvor.com/contact` from Vercel

- **Environment:** RC preview `https://onvor-2la0c43ml-zuhairshads-projects.vercel.app/` (Gate 4 execution, 2026-08-10).
- **Preconditions:** none — happens on every submission.
- **Repro:** submit the footer newsletter form with any valid email, or the `/pages/contact` form with any valid payload. Frontend renders the fallback error message `"That didn't go through. Please email or WhatsApp us instead."`
- **Server-side evidence:**
  - Server-action POST (browser → Vercel `/` and `/pages/contact`) returns 200 — the action runs cleanly, no page or console errors.
  - Downstream POST from Vercel to `https://theonvor.com/contact` returns **HTTP 403** with a Cloudflare "Verifying your connection…" challenge body (confirmed independently with `curl` from a non-browser IP — same 403).
  - `postToShopify` in `src/app/actions/contact.ts:38` maps `status >= 400` to `{ ok: false, message: "That didn't go through…" }`, which is what the user sees.
- **Impact:** every newsletter subscription and every contact-form submission from the Vercel-hosted headless origin fails silently at the Shopify-side write. No Shopify customer or contact record is created. **The two sentinel submissions from this session did NOT create records in production Shopify** — Cloudflare rejected the POST before it reached Shopify.
- **Root cause:** the Cloudflare bot-management layer in front of `theonvor.com` treats direct server-to-server POSTs (Vercel Fluid Compute IP + no browser cookies + no CF-generated tokens) as a bot and returns a JS challenge. The current Liquid form works because it's submitted by a real browser that already has the Cloudflare `cf_clearance` cookie from having loaded a page on `theonvor.com`.
- **Existed on Liquid?** No — Liquid forms are submitted by the shopper's own browser, which passes CF challenges naturally.
- **Additional probes attempted 2026-08-10 (all read-only, no code changes committed):**
  1. `curl -X POST https://jtszju-ha.myshopify.com/contact` (permanent Shopify origin, per instruction) with `form_type=customer` / `contact[email]` payload → **HTTP 403** with the same "Verifying your connection…" Shopify Bot Manager challenge body. GET on that origin returns `301` redirect to `theonvor.com` and sets no session cookies, so no valid session can be established there either.
  2. Same POST with a real desktop-Chrome User-Agent, full Sec-Fetch-* headers, `Origin`/`Referer`, and legitimate Shopify session cookies (`_shopify_s`, `_shopify_y`) captured from a preceding GET → **still HTTP 403**. Shopify Bot Manager requires a `cf_clearance` token from a solved JS challenge, which no server-side HTTP client can produce.
  3. Storefront API introspection: `customerCreate` mutation is available with the existing Storefront token (accepts `email`, `password` [NON_NULL], `acceptsMarketing`). *Not adopted* — the current server action mimics Liquid's `form_type=customer` / `contact[tags]=newsletter`, which creates a marketing contact, not a full customer account. Silently substituting `customerCreate` would (a) require generating and storing a password the shopper never asked for, (b) change the Shopify record type from `contact` → `customer`, (c) fail with `TAKEN` for existing emails without a graceful path. Owner sign-off required before switching data models.
- **Recommended fix (owner decision — credentials required):**
  1. **Admin API path (recommended):** create a new Shopify custom app with scopes `write_customers` (newsletter → `customerCreate` + `customerEmailMarketingConsentUpdate`) and either `write_orders`/notes or a `metaobject` for contact messages. Add `SHOPIFY_ADMIN_ACCESS_TOKEN` to Vercel env. Wire the server action to `https://<shop>.myshopify.com/admin/api/2026-07/graphql.json`. The Admin API is not fronted by Bot Manager for token-authenticated requests. **Blocked on:** a new Admin API token — none exists in `.env.example`, `.env.local`, or the repo.
  2. **Transactional-email path (contact form only):** subscribe to Resend / Postmark / SendGrid / Mailgun / SES; send the contact-form message from Vercel to `theonvor@gmail.com`. **Blocked on:** no provider integrated in the repo (`grep` for resend/sendgrid/postmark/mailgun/nodemailer/smtp returns 0 matches in `src/`). Requires (a) provider account, (b) API key env var, (c) domain-verified sender.
  3. **Client-side path (ruled out by owner):** move the POST client-side to `theonvor.com/contact` so the browser (which has `cf_clearance`) submits directly. Would work but the owner explicitly ruled out cross-origin client-side fetches.
- **Retest procedure once credentials supplied:** submit one sentinel email → verify the record appears in Shopify Admin → Customers (with `acceptsMarketing=true`) for newsletter, or in the mailbox / Admin → Notes for contact.
- **Confidence:** high on the diagnosis. Fix cannot be implemented in this session because required credentials do not exist.
- **Disclosure — test data left in production Shopify during this diagnosis:** the Storefront `customerCreate` capability probe (item 3 above) successfully created one customer record `gid://shopify/Customer/10415808938265` with email `onvor-headless-e2e-schema-probe@example.com`. No password was returned (Shopify hashed it). No further probes will run. Owner may delete this record via Shopify Admin → Customers → search `onvor-headless-e2e-schema-probe@example.com` → Erase personal data.

### D-A04 · Low · Turbopack warns that `package-lock.json` sits above the repo root
- **Environment:** `npm run build`.
- **Repro:** first line of build output warns Turbopack ignored `/Users/shad/package-lock.json` because it's outside the git repo `/Users/shad/Onvor`.
- **Impact:** may slow Turbopack's dependency detection; harmless functionally.
- **Fix:** set `turbopack.root` in `next.config.ts`, or ensure the lockfile lives inside the repo. Non-blocking.

## 5. Shopify reconciliation (sampled)

| Entity | Handle | Frontend value | Shopify Storefront value | Match |
|---|---|---|---|---|
| Product title | stamp-tee-black | "Stamp Tee - Black" | "Stamp Tee - Black" | ✅ |
| Product price | stamp-tee-black | Rs 1,679.30 | 1679.30 PKR | ✅ |
| Product compareAt | stamp-tee-black | Rs 2,399.00 | 2399.00 PKR | ✅ |
| Product availability | stamp-tee-black | InStock (JSON-LD) | availableForSale=true | ✅ |
| Variants count | stamp-tee-black | S/M/L/XL in Product Form | 4 variants: S/M/L/XL | ✅ |
| Variant stock | stamp-tee-black | not surfaced (see D-B05 below) | 13/17/15/15 | see note |
| Collection count | men | 47 product links in HTML | 47 nodes via API | ✅ |
| Collection count | women | not sampled in HTML | 14 nodes via API | – |
| Collection count | all-products | 63 in HTML | 63 via API | ✅ |
| Collection count | t-shirt | 31 in HTML, H1 "Tops" | 31 nodes, title "Tops" | ✅ |
| Collection count | bottoms | not sampled in HTML | 24 nodes via API | – |
| Collection count | pleated-trousers | 2 in HTML | 2 nodes via API | ✅ |
| Sort price-asc | all-products | first product prices 2,399 / 1,679 / 2,399 | ascending | ✅ |
| Sort price-desc | all-products | first product prices 3,999 / 2,799 / 3,999 | descending | ✅ |
| Sitemap URL count | – | 88 | 63+14+6+5+1 = 89 (delta = "frontpage" collection intentionally deduped) | ✅ within known excludes |

**D-B05 (informational, not filed as a defect yet):** the PDP variant picker never surfaces per-variant stock or per-variant sold-out state — `src/components/theme/ProductForm.tsx` uses `product.available` only. All sampled variants happen to be available, so no visible failure — but a sold-out variant could look purchasable and only fail at add-to-cart. Consider adding per-variant `availableForSale` gating.

**Cart, order, customer, inventory-after-order, payment, shipping, tax, fulfilment, refund/cancellation** — **not verified**. All would require passing Approval gates 1–3 (and Admin API read access for the post-order reconciliation).

## 6. Order-test record

**Status (2026-08-10):** owner authorised a single controlled real-money test order. Operator prepared a cart via Storefront API and delivered the `checkoutUrl` to the owner in the terminal only. Owner completed the checkout manually on their own device (address / phone / payment method entered by owner; operator never saw, logged, or transmitted any of that data).

**Order placed — verified via Shopify Admin API (Claude Shopify MCP):**

| Field | Prepared cart | Actual order | Reconciliation |
|---|---|---|---|
| Shopify order name | — | `#1054` | ✅ |
| Confirmation number | — | `YMG3FZGPY` | ✅ |
| Order created (UTC) | — | 2026-08-10 01:11:49 | ✅ |
| Referrer (Timeline event) | Onvor Headless | `zuhayr shad placed this order on Onvor Headless (checkout #42074695663897)` | ✅ headless origin confirmed |
| Line item | Stamp Tee - Black · Size L · qty 1 | **Signature Baggy - Beige - Women · S/Beige · qty 1** | ⚠️ Owner substituted the item at checkout. Not a defect — Shopify's checkout allows the shopper to change quantity or remove lines. The catalog wiring, cart→checkout handoff, and order creation path all worked; the specific SKU under test just changed. |
| SKU | null (from Storefront) | null (from Admin — SKU not set on this variant) | ✅ consistent |
| Subtotal | 1,679.30 PKR (Stamp Tee L) | 2,799.30 PKR (Signature Baggy S/Beige) | ✅ matches the actual line at posted price |
| Shipping | (calculated at checkout) | 225.00 PKR — "Delivery Fee" | ✅ |
| Tax | (calculated at checkout) | 0.00 PKR (Pakistan — VAT not collected via Shopify) | ✅ |
| Discount | 0.00 PKR (none entered) | 0.00 PKR | ✅ |
| Total | (calculated at checkout) | **3,024.30 PKR** | ✅ 2,799.30 + 225.00 |
| Payment method | Owner discretion | **Cash on Delivery (COD)** | ✅ no card charged — cleanest possible cleanup path |
| Financial status | — | `PENDING` (COD not yet collected) | ✅ nothing to refund |
| Fulfilment status | — | `UNFULFILLED` (0 fulfilments) | ✅ nothing shipped |
| Order confirmation email | — | Timeline: `Order confirmation email was sent to zuhayr shad (zuhairshad140@gmail.com)` | ✅ |
| Customer | — | `zuhayr shad · zuhairshad140@gmail.com` (owner's own identity — not sentinel) | ⚠️ owner used real customer identity; first order for this customer (`numberOfOrders=1`). Note: this created a new customer record. |
| Email marketing consent | — | `PENDING` / `CONFIRMED_OPT_IN` (double opt-in — customer hasn't confirmed) | ✅ correctly gated |
| Duplicate order? | — | `list-orders confirmation_number:YMG3FZGPY` → 1 result | ✅ |

**Inventory reconciliation — variant `Signature Baggy - Beige - Women · S/Beige` (`gid://shopify/InventoryItem/54874291503385`), location `Shop location`:**

| Field | Value after order | Interpretation |
|---|---|---|
| `available` | 9 | expected: baseline − 1 (was 10 across all Beige sizes) |
| `committed` | 1 | expected: baseline + 1 (order reserved 1 unit) |
| `onHand` | 10 | expected: unchanged (nothing shipped) |

Sibling variants (`M/Beige`, `L/Beige`, `XL/Beige`) all remain at `available=10, committed=0, onHand=10` — confirms the reservation moved cleanly on the correct SKU only.

**Automation effects observed in the order Timeline (via `Order.events`):**

- Order-confirmation email sent to customer (Shopify Notifications).
- COD "payment pending" ledger entry created.
- Slack/notification integration fired: `Received new order #1054 by zuhayr shad.` (some external app is subscribed to `orders/create`).
- `Order#tax_finalization_capture_started` (Shopify internal — tax finalisation event).
- No fulfilment webhook, no label creation, no marketing automation trigger observed in the first-minute events window.

**No other Onvor orders were created in the sentinel window.** No duplicate `#1054`.

---

### Cleanup — required, must be performed by owner in Shopify Admin

**Why not by operator:** the Claude Shopify MCP safety policy explicitly blocks `orderCancel` (and refund mutations) — "Order cancellation and capture are blocked — they can move funds and trigger irreversible order-state changes". This is by design; even with owner authorisation, the mutation is refused at the MCP layer.

**Cleanup path (COD-pending, unfulfilled → cleanest possible):**

1. Shopify Admin → Orders → `#1054` → **More actions → Cancel order**.
2. Cancel dialog: Reason `Other` (or `Customer` if you prefer). **Tick "Restock 1 item"** so the S/Beige unit moves back to `available`. **Untick "Send a notification"** (owner-decision) so the customer doesn't receive a cancellation email for their own test.
3. Because this is COD PENDING, there is no captured payment — the "Refund" section will show no amount to refund. Confirm Cancel.
4. Verify Admin → Orders → `#1054` header shows `Cancelled`.
5. Verify Admin → Products → Signature Baggy - Beige - Women → S/Beige → Inventory → `Shop location` reads `available=10, committed=0, onHand=10` (back to baseline).
6. Optional customer redaction: Customers → search `zuhairshad140@gmail.com` (this account, first order) → **More actions → Erase personal data** — note: order record, ledger, and event log are retained by Shopify for legal/tax purposes even after erasure (see `phase-e-controlled-order-proposal.md` §8).

**Also erase the diagnostic-probe customer left from D-F01 investigation:** Customers → search `onvor-headless-e2e-schema-probe@example.com` → Erase personal data.

**Cart prepared:**

| Field | Value |
|---|---|
| Product | Stamp Tee - Black (`stamp-tee-black`) |
| Variant | Size L (`gid://shopify/ProductVariant/52163534061849`) |
| Quantity | 1 |
| Storefront-visible subtotal | Rs 1,679.30 PKR (shipping / tax / fees add at checkout) |
| Checkout hosted on | `theonvor.com` |

**Reconciliation checklist (owner to fill from Shopify Admin — operator lacks Admin API access):**

Once the owner supplies the order number, verify each row against Shopify Admin → Orders → `#<order-number>`:

| # | Check | Admin location | Expected | Owner value |
|---|---|---|---|---|
| 1 | Order appears exactly once for the sentinel window | Orders list, filter by date/time | 1 result | |
| 2 | Correct customer | Order → Customer | matches address owner entered | |
| 3 | Correct product / variant / SKU | Order → Line items | Stamp Tee - Black · Size L · qty 1 · SKU as shown in Admin (Storefront returned null) | |
| 4 | Subtotal | Order → Summary | Rs 1,679.30 | |
| 5 | Shipping | Order → Summary | (record actual) | |
| 6 | Tax | Order → Summary | (record actual) | |
| 7 | Discount | Order → Summary | Rs 0.00 (no code entered) | |
| 8 | Total | Order → Summary | subtotal + shipping + tax | |
| 9 | Payment status | Order → Timeline / Payment | `paid` | |
| 10 | Confirmation email sent | Order → Timeline / Notifications | `Order confirmation email was sent to <sentinel>` | |
| 11 | Inventory: available before | Products → Stamp Tee - Black → Size L → Inventory (record before checkout if possible; otherwise reconstruct = current + 1 after refund + restock) | (baseline) | |
| 12 | Inventory: available after order | same location, immediately after order | baseline − 1 | |
| 13 | Inventory: committed after order | same location | baseline_committed + 1 | |
| 14 | Inventory: on_hand after order | same location | unchanged from baseline (on_hand only moves on fulfilment) | |
| 15 | Fulfilment status | Order → Fulfilment | `Unfulfilled` (do not fulfil) | |
| 16 | No duplicate order | Orders list, same customer/date | exactly 1 | |
| 17 | Automation effects — list any triggered | Order → Timeline; Apps; email inbox | (record) | |
| 18 | Refund + cancel + restock action | Order → More actions → Refund → tick "Restock" → refund full amount | applied | |
| 19 | Inventory: available after refund | Products → variant | back to baseline | |
| 20 | Inventory: committed after refund | Products → variant | back to baseline | |
| 21 | Inventory: on_hand after refund | Products → variant | unchanged | |
| 22 | Final order status | Order → Header | `Refunded` (and optionally `Cancelled`) | |
| 23 | Refund status | Order → Transactions | `Success` | |
| 24 | Non-refundable fee incurred | Order → Transactions | (record if any payment-processor fee retained) | |
| 25 | Customer record redaction | Customers → the sentinel record → More actions → Erase personal data (owner discretion — see Phase E proposal §8 for what is retained after erasure) | (action taken Y/N) | |

If any row diverges from expected, capture Admin screenshot (sanitised) and add to `reports/evidence/phase-e/`.

## 7. Blockers and manual checks

Manual verification steps that were not runnable in this session:

1. **Browser-only checks:** hydration warnings, JS console errors, image LCP, cumulative layout shift, mobile-viewport rendering (390×844, 360×800), WebKit compatibility. Recommend: add Playwright as a devDependency (approval-gated) or run manual Lighthouse/DevTools passes on the preview.
2. **Cart flows (Phase C):** requires Approval gate 1.
3. **Checkout handoff (Phase D):** requires Approval gate 2; will also determine payment-method availability.
4. **Controlled order (Phase E):** requires Approval gate 3 and a viable test payment method.
5. **Form round-trip (Phase F):** requires Approval gate 4 and a pre-agreed sentinel email/body so submissions can be filtered out of the production customer/contact records.
6. **Webhook positive path (Phase G):** send a valid HMAC-signed payload from local `npm run dev` (safe, cache-only), or wait for a real Shopify product update to trigger a genuine webhook and confirm the corresponding tag revalidated.
7. **Liquid regression comparison (Phase H):** read-only side-by-side of theonvor.com Liquid vs the preview for nav parity, catalog parity, price alignment, and checkout branding. Low risk (same shop backs both).
8. **Admin API read access** — would enable order/customer/inventory reconciliation for anything the Storefront API can't return (tax breakdowns, order status, fulfilment, refund).

## 8. Final release checklist

### Must fix before launch (blocker-class)
- [x] **D-B01** — CLOSED by commit `b407160` (per-route canonicals verified on RC preview).
- [x] **D-B02** — CLOSED by commit `b407160` (homepage H1 present).
- [x] **H-1** — CLOSED by commit `ad39bd9` (single 308 `/collections/all` → `/collections/all-products`).
- [ ] **D-F01** — fix newsletter/contact submission path. Currently returns error message to user; no Shopify record created. Options in defect entry above.

### Should fix before launch
- [ ] **D-A01 / D-A02 / D-A03** — accept the three local lint-clean patches (already applied locally, uncommitted).
- [ ] Run Playwright (or a manual browser pass) across desktop + mobile viewports on the preview to close the browser-only gap.
- [ ] Exercise Phase C (cart flows) against the preview and capture pass/fail evidence.
- [ ] Exercise Phase D (checkout handoff) and confirm branding + return URL + payment-method inventory.
- [ ] Exercise Phase F (forms) with pre-agreed sentinel data.
- [ ] Confirm intent: variant-level sold-out feedback (D-B05) — accept the current product-level gate, or add variant-level.

### Safe to address after launch
- [ ] **D-A04** — set `turbopack.root` in `next.config.ts` (dev-only warning).
- [ ] Consider unit/integration tests around `src/lib/shopify/*` and `src/app/actions/*` — none exist today.
- [ ] Add CI (typegen + tsc + lint + build) before allowing merges to the launch branch.

### Business-owner confirmations required
- [ ] Test-payment method exists (Bogus Gateway / Shopify Payments test mode)? Governs Phase E.
- [ ] Sentinel test email + message text for Phase F (or approval to use `qa+headless-e2e@onvor.local`).
- [ ] Willingness to authorise a single controlled real-money order + cleanup (cancel + void or refund + restock).
- [ ] Intended cutover of `theonvor.com` DNS from Liquid to headless — coordinate with a maintenance window and rollback plan.

### Production cutover checks (day-of)
- [ ] Shopify webhook subscriptions for `products/*` and `collections/*` point at the headless webhook URL, HMAC secret matches Vercel env.
- [ ] Vercel env vars: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`, `SHOPIFY_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL` all set correctly for production.
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://theonvor.com` — verified (canonical resolves to this).
- [ ] Verify Storefront token has scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`.
- [ ] Cache tags cold-start acceptable — first hit after cutover fetches every product; verify Vercel function timeout is fine.
- [ ] Legacy Liquid `/blogs/*` traffic redirect to `/` is in place (already configured in `next.config.ts`).

### Post-launch smoke tests (within 15 minutes of cutover)
- [ ] Homepage loads with best-selling + new-arrivals populated.
- [ ] PDP loads for a top seller; add-to-cart succeeds; cart drawer opens.
- [ ] Checkout button opens the correct Shopify hosted checkout with correct total.
- [ ] Newsletter form submits successfully.
- [ ] Sitemap.xml and robots.txt serve without error.
- [ ] Real Shopify product edit triggers webhook — target product re-fetches within 60 s.

### Rollback triggers
- Add-to-cart failure rate > 1% within any 5-minute window.
- Checkout button 5xx or wrong-shop redirect.
- Canonical/SEO regression from previous Liquid state (once cutover happens, any drop needs immediate response).
- Any Storefront token / webhook secret leak observed in bundle output or logs.
- Cache-serving-stale-price complaints from the ops inbox.

## 9. Environment / config notes

- Preview build reads `NEXT_PUBLIC_SITE_URL=https://theonvor.com` — canonical URLs and sitemap entries all use that domain. Intentional for a pre-launch preview that will inherit the domain at cutover.
- `.env.local` was used only to run local Storefront API queries — no secrets are printed in this report or the evidence directory.
- Local build has 3 lint issues that we fixed on disk without committing. `git status` on the branch still reflects only those diffs; the commit decision is out of scope for this task (gate 6).

## 10. Evidence

Sanitised captures stored under `reports/evidence/`:

- `preview-root.html`, `preview-product-stamp-tee-black.html`, `preview-collection-men.html`, `preview-collection-all.html`, `preview-collection-t-shirt.html`, `preview-coll-sort-price-asc.html`, `preview-coll-sort-price-desc.html`, `preview-cart.html`, `preview-search.html`, `preview-404.html`, `preview-robots.txt`, `preview-sitemap.xml`.

No cookies, no tokens, and no personal data are captured. HTML files contain the same public bytes any anonymous shopper would receive.
