# Shopify Redirect-Theme Plan — Onvor

**Date:** 2026-08-13
**Prepared by:** headless engineering (Claude)
**Status:** PREPARED — NOT PUBLISHED. Awaiting owner approval.

## 1. Problem restated

`checkout.theonvor.com` is the Shopify shop's primary domain (verified below). The still-published Liquid theme "Copy of Copy of glamourin | AK" (`gid://shopify/OnlineStoreTheme/190590779673`, role `MAIN`) therefore:

1. Serves the old Liquid storefront to anyone hitting `https://checkout.theonvor.com/…`.
2. Provides the "Continue shopping" destination that Shopify's hosted checkout renders after order completion (that button resolves to `shop.url = https://checkout.theonvor.com`).

The headless Next.js storefront at `https://theonvor.com` must remain the only customer-visible storefront while Shopify continues to host cart/checkout/orders/payments/admin.

## 2. Current state — evidence

**Shop domains (`shop` query, Admin API):**

- `primaryDomain.host = checkout.theonvor.com`
- `shop.url = https://checkout.theonvor.com`
- `myshopifyDomain = jtszju-ha.myshopify.com`

**Live checkoutUrl (Storefront API `cartCreate` at 2026-08-12T19:01Z):**

- Host: `checkout.theonvor.com`
- Path shape: `/cart/c/<token>?key=<key>`
- User errors: `[]`
- Matches `shop.primaryDomain` — expected Shopify behavior; nothing wrong with the API integration.

**Cart integration in the Next.js app (unchanged, correct):**

- `src/lib/shopify/fragments.ts:114` — `Cart.checkoutUrl` is selected on every cart read.
- `src/app/actions/cart.ts:57-78` — server action resolves variant then calls `addCartLines`, no URL rewriting.
- `src/app/cart/page.tsx:73` — `<a href={cart.checkoutUrl}>` used verbatim.
- `src/components/theme/CartDrawer.tsx:208` — same.
- Prior evidence: `reports/phase-d-checkout-report.md:21-58` documented that the button URL is byte-identical to the API response and produces exactly one redirect.

**Conclusion:** The Next.js side is doing the right thing. The problem is entirely on the Shopify domain / theme side.

**Current published theme:**

- Live theme id `190590779673` (name "Copy of Copy of glamourin | AK") is `MAIN`. Confirmed against the `Server-Timing: theme;desc="190590779673"` header returned by `checkout.theonvor.com/`.
- The Liquid storefront currently 302s to `/password` (`x-shopify-stage: production`, plain Shopify response) — password protection is enabled. That protection is a courtesy fig-leaf; it will lift at launch and expose the Liquid store unless the redirect theme is published.

## 3. Approach — Shopify Hydrogen Redirect Theme

Reference: `https://github.com/Shopify/hydrogen-redirect-theme` (Shopify official; MIT).

**Mechanism (verified by reading `layout/theme.liquid` in the repo):**

- Every template is a stub (`.json` section groups with a single `main-redirect` section; the section body is empty). All output comes from `layout/theme.liquid`.
- `layout/theme.liquid` runs inline JS that calls `window.location.replace(...)` to `https://<storefront_hostname><request.path><query>`, i.e. it swaps only the host and keeps the path + query — matching your "preserve path and query parameters" requirement.
- Guards:
  - `assign should_redirect = template != blank` — app-proxy routes (`/apps/*`, `/a/*`, `/community/*`, `/tools/*`) and system routes have blank `template`, so they are not touched.
  - JS also skips `/checkpoint`, `/throttle/queue`, `/challenge` (bot protection / queueing).
  - Skipped when `window.Shopify.designMode` is true (theme editor preview stays viewable).
  - Loop guard: `if (currentHostname !== storefrontHostname)` — will not redirect if already on `theonvor.com`, so no self-loop risk on the Next.js origin.
- Shopify's hosted checkout (`/checkouts/…`, `/wallets/checkouts/…`) is a separate system that does **not** load storefront theme templates at all, so it is unaffected by the redirect theme.
- Post-order emails' order-status link (`/orders/<token>/authenticate`) is also served by checkout infra, not the theme.
- Discount links (`/discount/CODE`) are handled by Shopify's redirect handler before the theme runs, and the JS re-attaches `?discount=CODE` when it sees a `discount_code` cookie.
- Non-JS fallback: a visible "Redirecting… Click here if you are not automatically redirected" link pointing at `https://<storefront_hostname>/`.
- Theme sets `<meta name="robots" content="noindex">` globally.

## 4. Files prepared (local, not uploaded)

Cloned into `shopify-redirect-theme/` and zipped for upload at `reports/shopify-redirect-theme.zip`. Repo-management files (`README.md`, `LICENSE.md`, `package.json`, `.github/`, etc.) are excluded from the ZIP; only theme files are inside.

Included in ZIP:

```
assets/template-giftcard.css
config/settings_schema.json
config/settings_data.json      ← added; pre-sets storefront_hostname="theonvor.com"
layout/theme.liquid
sections/main-redirect.liquid
snippets/icon-success.liquid
templates/{404,article,blog,cart,collection,index,list_collections,page,password,product,search}.json
templates/{checkpoint,gift_card,robots.txt}.liquid
templates/customers/{account,activate_account,addresses,login,order,register,reset_password}.json
```

**Only file authored by us:** `config/settings_data.json` (30 lines) — pre-selects `storefront_hostname = "theonvor.com"` and leaves `custom_redirects` empty and customer-accounts integration off. This means the theme is preview-ready the moment it is uploaded; no customizer editing required before the preview test.

**No changes to the Next.js repo, `.env.local`, or any Shopify config were made.** Only unstaged, untracked files under `shopify-redirect-theme/` and `reports/` were created.

## 5. What owner must do in Shopify Admin (no code)

**Preview (safe, non-publishing):**

1. Shopify Admin → **Online Store** → **Themes**.
2. Under **Theme library**, click **Add theme** → **Upload zip file** → select `reports/shopify-redirect-theme.zip`.
3. On the newly listed theme (name will be "Hydrogen Redirect Theme"), click **Actions** → **Preview**.
4. Copy the preview URL from the top-right ("Share preview") — it will look like `https://checkout.theonvor.com/?preview_theme_id=<ID>`.
5. Send the preview URL back to me for verification (§7).

**Publish (only after you approve preview results):**

6. Same theme → **Actions** → **Publish**.
7. Leave the old "Copy of Copy of glamourin | AK" theme unpublished; do not delete it until the new theme has run successfully for at least 72 hours.

**Optional but recommended once we launch:**

8. Turn OFF the password protection on the Liquid storefront (`Online Store` → `Preferences` → uncheck "Restrict access"). The redirect theme itself makes password protection redundant — anyone hitting the old domain gets bounced to `theonvor.com`.

**Alternative if you'd rather I upload it via API:** I can call `themeCreate` + `themeFilesUpsert` to create an unpublished theme in your shop directly (both mutations are allowed against unpublished themes per Shopify's tool guardrails; publishing is blocked, which is what we want). Say the word and I will. The manual ZIP upload is the same end result and one fewer moving part.

## 6. Test URLs and expected results

Once the theme is uploaded and previewed, verify each of these (open in a private window so cookies don't muddy the picture):

| Test URL | Expected result | Confirms |
|---|---|---|
| `https://checkout.theonvor.com/?preview_theme_id=<ID>` | JS redirect to `https://theonvor.com/` | Root redirect works |
| `https://checkout.theonvor.com/products/stamp-tee-black?preview_theme_id=<ID>` | Redirect to `https://theonvor.com/products/stamp-tee-black` | Path preserved |
| `https://checkout.theonvor.com/collections/men?preview_theme_id=<ID>` | Redirect to `https://theonvor.com/collections/men` | Collection paths preserved |
| `https://checkout.theonvor.com/cart?preview_theme_id=<ID>` | Redirect to `https://theonvor.com/cart` | Cart-page redirect works |
| `https://checkout.theonvor.com/search?q=tee&preview_theme_id=<ID>` | Redirect to `https://theonvor.com/search?q=tee` | Query string preserved |
| `https://checkout.theonvor.com/discount/FREESHIP?preview_theme_id=<ID>` | Redirect to `https://theonvor.com/?discount=FREESHIP` | Discount cookie handling |
| Add a real product to the headless cart at `theonvor.com`, click Checkout, then on the checkout page confirm "Return to shop"/logo link points at `https://theonvor.com` (Shopify checkout reads `shop.url` but the redirect theme kicks in the moment it lands on `checkout.theonvor.com/`) | Lands on `https://theonvor.com/` | End-to-end "Continue shopping" fix |
| Any real `https://checkout.theonvor.com/checkouts/cn/<token>` URL (Shopify hosted checkout) | Loads Shopify checkout normally, **not** redirected | Checkout is untouched |
| `https://checkout.theonvor.com/apps/<any>` (if any app proxy exists) | Not redirected (app proxy — blank template) | App proxies untouched |

**Do the checkout tests BEFORE publish** — the preview theme scope means only the preview URL is affected, and real checkout continues on the current MAIN theme (which itself doesn't touch checkout, so nothing changes). After publish, re-run the two checkout-related rows with fresh carts.

## 7. Checkout-exclusion confirmation

The Shopify hosted checkout runs on separate infrastructure and does not load storefront theme templates. Evidence:

- Checkout responses have `x-checkout-page: true` (Shopify's own header) and do not include the `theme;desc="<id>"` timing entry the storefront produces.
- The redirect theme has no `templates/checkout*.liquid` (checkout has been non-customizable via theme since Shopify's checkout-extensibility rollout).
- The theme's `should_redirect` guard also skips anything with a blank `template` object, which includes `/checkouts/*`, `/wallets/*`, `/apps/*`, `/a/*`, `/community/*`, `/tools/*`, and the app-proxy family.
- Customer accounts (the new system) are hosted on `shop.myshopify.com/authentication/…` and `shopify.com/authentication/…` — not on the shop's primary domain, so also untouched.
- Order-status pages resolve under `/orders/<token>/authenticate`, served by checkout infra — untouched.

## 8. Risks / blockers before publish

1. **JS-only redirect.** Non-JS crawlers hitting `checkout.theonvor.com/products/x` will see the "Redirecting… Click here" stub, not the real product. The `<meta name="robots" content="noindex">` header prevents SEO indexing of that stub. Impact: minimal — customers use JS; robots are told not to index.
2. **`/account/*` legacy customer routes.** The theme includes `templates/customers/*.json` stubs which will redirect to matching paths on `theonvor.com`. The Next.js `/account` page currently renders a "not wired up" stub. Verify with a test: hitting `https://checkout.theonvor.com/account/login` should redirect to `https://theonvor.com/account/login`. If that URL 404s in Next, we should add a `custom_redirects` rule (`/account/login > /account`) or point it at Shopify's new customer accounts URL — decide before publish.
3. **Order status link in transactional emails.** These are hard-coded to `checkout.theonvor.com/orders/<token>/authenticate`. Verified above that this path is served by checkout infra, not the theme, so the redirect theme does not affect them. Recommend one clean test: place a $0 test order (or use a completed real order confirmation email) and click the "View your order" link to confirm it still loads the order status page.
4. **Discount code redirect param.** Theme converts `?discount=CODE` cookie into a query param on the storefront URL. The Next.js app does not currently read `?discount=…` server-side — it defers all discount entry to Shopify checkout. This is fine (worst case the param is ignored and the customer enters the code at checkout), but a future improvement is to auto-apply the code by hitting the storefront cart API. Not blocking.
5. **Password protection.** Currently enabled on the Liquid storefront (`checkout.theonvor.com/` 302s to `/password`). The redirect theme's JS runs from `layout/theme.liquid`, which the password page *does* use. Confirm during preview that the password gate does not swallow the redirect. If it does, the fix is either to remove password protection at cutover (recommended) or to keep protection off during preview validation. This is the highest-priority thing to verify in preview.
6. **Robots.txt.** Theme's `templates/robots.txt.liquid` is 26 bytes — probably `User-agent: *\nDisallow: /`. Confirm this is what you want on `checkout.theonvor.com`. It's a good default (keeps the redirect-only host out of the index) but if you rely on any `checkout.theonvor.com` URL being crawled (unlikely), you'd want to override.
7. **Do not delete the old theme yet.** Even after publish, keep "Copy of Copy of glamourin | AK" unpublished for at least a week as an instant rollback.

## 9. What I did NOT do

- Did not upload, preview, or publish any theme in Shopify.
- Did not change `SHOPIFY_STORE_DOMAIN`, primary domain, sales-channel storefront URLs, or any other Shopify config.
- Did not edit Next.js source, `.env.local`, or `next.config.ts`.
- Did not modify or delete the existing MAIN theme.
- Did not create or send any test order; the only Shopify write was a single `cartCreate` mutation via the Storefront API to capture the current `checkoutUrl` host (line above), consistent with prior read-only phases.

## 10. What I need from you to proceed

Please confirm one of:

- **A.** "Upload the ZIP manually and preview it" — you handle §5 steps 1–4, send me the preview URL, I run §6 tests and report back.
- **B.** "Upload it via API for me" — I call `themeCreate` + `themeFilesUpsert` against your shop to create the unpublished theme, then send you the preview URL for your visual inspection.

Either way, publish only happens after your explicit "publish" instruction and after §6 passes.
