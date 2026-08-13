# Onvor Headless — Shopify Test Matrix

**Target:** `https://onvor.vercel.app/` (Vercel preview) + local `npm run dev`.
**Shopify shop:** `jtszju-ha.myshopify.com` — confirmed to be the production shop behind `theonvor.com`. Every action treated as production.
**Storefront API version:** `2026-07`.
**Test method:** curl + direct Storefront API queries, no browser automation (per owner decision).
**Legend:** `PASS`, `FAIL`, `BLOCKED`, `N/A`, `NOT TESTED – APPROVAL REQUIRED` (`NT-AR`).

| ID | Area | Test | Env | Result | Severity | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| A01 | Build | `npx next typegen` | local | PASS | – | stdout: `✓ Types generated successfully` | |
| A02 | Build | `npx tsc --noEmit` | local | PASS | – | exit 0 | after lint fixes for D-A01/A02/A03 |
| A03 | Build | `npm run lint` | local | FAIL → PASS | Medium | see D-A01, D-A02, D-A03 | fixed locally (uncommitted) |
| A04 | Build | `npm run build` | local | PASS | – | 102 static pages generated | reads Shopify (read-only) |
| A05 | Build | package-lock at wrong root | local | WARN | Low | see D-A04 | set `turbopack.root` |
| B01 | Global | `/robots.txt` reachable, disallows /cart /account /search /api/ | preview | PASS | – | `reports/evidence/preview-robots.txt` | Sitemap URL points at `theonvor.com` (intentional pre-launch) |
| B02 | Global | `/sitemap.xml` reachable, contains live handles | preview | PASS | – | 88 URLs, 63 products + 13 collections + 6 pages + 5 policies + root | |
| B03 | Global | Canonical link on every route | preview | FAIL | High | see D-B01 | all routes canonical=`https://theonvor.com` (root) |
| B04 | Global | Homepage has H1 | preview | FAIL | Medium | see D-B02 | only `/` missing H1 (12/13 sampled pages OK) |
| B05 | Global | Header nav server-rendered | preview | PASS | – | Shop All / Tees / Trousers / Men / Women / Contact / Wishlist / Search / Cart / Size Guide / Sustainability all in HTML | |
| B06 | Global | Footer newsletter form + socials in HTML | preview | PASS | – | newsletter input + instagram link found | |
| B07 | Global | 404 on unknown product handle | preview | PASS | – | HTTP 404 + "moved on" copy | |
| B08 | Home | Best Selling + New Arrivals rows populated | preview | PASS | – | 12+ unique product links present | |
| B09 | Home | Azadi Sale ticker rendered | preview | PASS | – | "Azadi" and "Flat 30" strings in HTML | |
| B10 | PDP | Product page renders (stamp-tee-black) | preview | PASS | – | HTTP 200, title correct, JSON-LD present | |
| B11 | PDP | JSON-LD Product schema present | preview | PASS | – | `@type: Product`, offers with price, currency PKR, availability InStock | |
| B12 | PDP | Frontend price matches Storefront API | preview + API | PASS | – | preview=1679.3 / compareAt=2399.0; API=same | |
| B13 | PDP | Variants list matches Storefront API | API | PASS | – | S/M/L/XL, all available, 13/17/15/15 in stock | not surfaced to shopper via variant availability UI (D-B05) |
| B14 | Collection | `/collections/men` product count matches API | preview + API | PASS | – | HTML=47, API=47 | |
| B15 | Collection | `/collections/all-products` product count matches API | preview + API | PASS | – | HTML=63, API=63 | |
| B16 | Collection | `/collections/t-shirt` H1 = admin title "Tops" (URL slug unchanged) | preview + API | PASS | – | H1 "Tops", 31 products, matches API | intentional |
| B17 | Collection | `?sort=price-desc` puts highest-priced first | preview | PASS | – | first prices 3,999 / 2,799 / 3,999 (compareAt/sale) | |
| B18 | Collection | `?sort=price-asc` puts lowest-priced first | preview | PASS | – | first prices 2,399 / 1,679 / 2,399 | |
| B19 | Collection | pleated-trousers renders 2 products (not empty) | preview + API | PASS | – | API=2, HTML=2 | |
| B20 | Search | `/search?q=tee` returns tee products | preview | PASS | – | 20+ results, all handles contain "tee" | |
| B21 | Cart | `/cart` empty state renders | preview | PASS | – | HTTP 200, "Your bag" heading | no cart cookie set during test |
| B22 | Account | `/account` stub renders | preview | PASS | – | H1 "Account", intentional stub | |
| B23 | Wishlist | `/wishlist` renders SSR | preview | PASS | – | H1 "Wishlist" | client-only state after mount |
| B24 | Pages | `/pages/contact,customer-care,garment-care,lookbook,size-guide,sustainability` render | preview | PASS | – | all HTTP 200, H1 present | |
| B25 | Policies | `/policies/refund-policy,shipping-policy` render hardcoded content | preview | PASS | – | H1 present, HTTP 200 | |
| C01–C15 | Cart | Add/update/remove, persistence, error paths | – | NT-AR | – | – | Approval gate 1 pending |
| D01–D06 | Checkout | Handoff, branding, payment method reconnaissance | – | NT-AR | – | – | Approval gate 2 pending |
| E01 | Order | Controlled test order | – | NT-AR | – | – | Approval gate 3 pending; depends on test-payment existence |
| F01 | Forms | Newsletter form target/POST shape | preview | PARTIAL PASS | – | `action=""` (server action) | Server-side action posts to `https://theonvor.com/contact` (verified in code, not by round-trip) |
| F02 | Forms | Contact form target/POST shape | preview | PARTIAL PASS | – | same as F01 | |
| F03 | Forms | Newsletter/contact round-trip with sentinel data | – | NT-AR | – | – | Approval gate 4 pending — sentinel email/body needed |
| G01 | Webhook | GET `/api/webhooks/shopify` → 405 | preview | PASS | – | HTTP 405 | |
| G02 | Webhook | POST no signature → 401 | preview | PASS | – | HTTP 401 | |
| G03 | Webhook | POST bad signature → 401 | preview | PASS | – | HTTP 401 | |
| G04 | Webhook | POST valid signature revalidates tag | – | NT-AR | – | – | Positive path needs either signed synthetic against local dev, or a real product update triggered in Shopify Admin |
| H01 | Regression | Liquid catalog vs headless catalog | – | NT-AR | – | – | Read-only compare pending; low risk since same Shopify shop backs both |

## Legend of deferred phases

Everything in phases C, D, E, F (round-trip), and H remains behind explicit approval gates as agreed. Phase B was completed without triggering any Shopify writes.
