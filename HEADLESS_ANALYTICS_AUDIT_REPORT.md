# Final Proof-Based Headless Analytics & Attribution Audit Report

**Store**: ONVOR (`theonvor.com` / `checkout.theonvor.com`)  
**Shop ID**: `99646538009`  
**Platform**: Next.js App Router (Turbopack) + Shopify Storefront API + Hosted Shopify Checkout  
**Currency**: PKR  
**Audit Date**: August 14, 2026  
**Audit Phase**: Final Proof-Based Verification (Pass 3 - Consent Engine Complete)  

---

## 1. Provider Status Summary

| Provider | Configured ID | Exact Verification Status | Evidence Summary |
| :--- | :--- | :--- | :--- |
| **Google Analytics 4 (GA4) / GTM** | `G-JD6C3GXY26` / `GT-WBLSRCZV` / `AW-18302441675` | **Network Verified Only**<br>*(Blocked: dashboard login required)* | Browser executes `gtag.js`, pushes standard ecommerce events (`view_item`, `add_to_cart`, `view_cart`, `begin_checkout`, `search`) to `window.dataLayer`, and emits network requests to `https://www.googletagmanager.com/gtag/js` and `google-analytics.com/g/collect` **only after Analytics consent is granted**. GA4 DebugView / Realtime verification requires Google account access. |
| **Meta Pixel (Facebook Pixel)** | `1261670659444600` | **Network Verified Only**<br>*(Blocked: dashboard login required)* | Browser executes `fbevents.js`, triggers `fbq('track', ...)` (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Search`, `Lead`), and emits network requests to `https://connect.facebook.net/en_US/fbevents.js` and `https://www.facebook.com/tr/` **only after Marketing consent is granted**. Meta Events Manager Test Events verification requires Meta Business Manager account login. |
| **TikTok Pixel** | Unset in `.env.local` | **Not Configured**<br>*(Function Verified Only in code)* | Provider dispatch functions in `src/lib/analytics/providers/tiktok.ts` are fully typed, hold consent by default, and are tested via test harness. The pixel script is conditionally not loaded until `NEXT_PUBLIC_TIKTOK_PIXEL_ID` is provided. |

---

## 2. Technical Audit of Shopify Web Pixels & Monorail in Custom Headless Architecture

To eliminate any ambiguity regarding how Shopify interacts with this custom Next.js storefront:

### 2.1 `window.Shopify.analytics.publish`
- **Architecture Reality**: `window.Shopify.analytics.publish` is **NOT** a native Shopify browser API in this headless application. It is an **application-created JavaScript shim** initialized in `src/components/integrations/ShopifyAutomationScripts.tsx`.
- **Functionality**: It pushes event tuples `[eventName, payload, options]` into a client-side `replayQueue` and dispatches DOM CustomEvents (`shopify:${eventName}`) for client listeners (e.g. Pushbots, Shopify Forms).

### 2.2 `extensions.shopifycdn.com` Web Pixels Loader
- **Architecture Reality**: The script `<Script src="https://extensions.shopifycdn.com/cdn/shopifycloud/web-pixels-manager/0.0.334/bundle.js" />` is loaded in the browser.
- **Limitation**: In a monolithic Shopify Liquid theme, Shopify's backend injects an inline `wpmLoader({...})` bootstrap containing a signed store session and pixel subscription list. In a standalone headless Next.js environment, the Web Pixels Manager operates without a server-injected Liquid session cookie (`_shopify_s`).

### 2.3 Monorail Site Abandonment Beacon
- **Architecture Reality**: The Monorail beacon in `ShopifyAutomationScripts.tsx` is a **manually constructed client-side beacon**, not native Liquid tracking.
- **Functionality**: On `window.pagehide`, it formats a JSON schema `online_store_buyer_site_abandonment/1.1` and transmits it via `navigator.sendBeacon` to `https://monorail-edge.shopifysvc.com/v1/produce`.

### 2.4 Shopify Admin Analytics Dashboard (Sessions & Store Conversion Rate)
- **Architectural Limitation**: **Shopify Admin Online Store Analytics (Sessions, Visitors, Online Store Conversion Rate) does NOT record storefront browsing events from this custom Next.js architecture.**
- **Reason**: Shopify's legacy Online Store reports only ingest requests routed through Shopify's Liquid theme web server. GA4, Meta Pixel, and TikTok Pixel serve as the primary source of truth for storefront traffic and conversion funnel analytics.

---

## 3. Controlled Attribution Lifecycle Test

A controlled end-to-end journey was executed with unique parameters:
```text
https://theonvor.com/?utm_source=analytics_audit&utm_medium=controlled_test&utm_campaign=august_headless_audit&gclid=test-gclid-unique&fbclid=test-fbclid-unique&ttclid=test-ttclid-unique
```

### 3.1 Verification Checklist Across Journey

| Stage | Expected Behavior | Observed Result | Evidence Status |
| :--- | :--- | :--- | :---: |
| **1. Storefront Capture** | Landing parameters parsed and conditionally stored based on consent. | If consent granted, stored in `localStorage('onvor_attribution_first')`, `localStorage('onvor_attribution_last')`, `sessionStorage`, and `onvor_attribution` cookie. Suppressed before consent. | **PASS** |
| **2. Client-Side Navigation** | Attribution persists across Next.js App Router route transitions. | Navigated between `/`, `/products/...`, `/collections/...`, `/search` with parameters retained in storage and cookies. | **PASS** |
| **3. Cart Attributes Write** | Server action syncs attribution to Shopify Cart via Storefront API. | `src/app/actions/cart.ts` invokes `updateCartAttributes` (`cartAttributesUpdate`) with `_utm_source: "analytics_audit"`, `_utm_medium: "controlled_test"`, `_utm_campaign: "august_headless_audit"`, `_gclid: "test-gclid-unique"`, `_fbclid: "test-fbclid-unique"`, `_ttclid: "test-ttclid-unique"`. | **PASS** |
| **4. Cart Mutation Retention** | Cart attributes survive line additions, updates, and removals. | Storefront API cart query confirms attributes remain attached to the cart session. | **PASS** |
| **5. Checkout URL Handoff** | Checkout redirect URL includes all marketing parameters. | `appendAttributionToUrl()` generates: `https://checkout.theonvor.com/cart/c/...&utm_source=analytics_audit&utm_medium=controlled_test&utm_campaign=august_headless_audit&gclid=test-gclid-unique&fbclid=test-fbclid-unique&ttclid=test-ttclid-unique`. | **PASS** |
| **6. Final Shopify Order `customAttributes`** | Shopify copies cart attributes into `order.customAttributes` upon order completion. | Requires completing a live financial transaction on active production store. | **BLOCKED**<br>*(Live test order required)* |

---

## 4. Purchase Tracking & Shopify Checkout Web Pixels

### 4.1 Purchase Tracking Architecture
- On this headless storefront, clicking "Checkout" triggers `checkout_started` / `begin_checkout` / `InitiateCheckout`.
- **Synthetic purchase events are deliberately NOT fired on the storefront** when clicking checkout.
- Purchase tracking is executed natively on Shopify's hosted checkout confirmation page (`checkout.theonvor.com/checkouts/.../thank_you`).

### 4.2 Connected Shopify Checkout Apps & Pixels
Based on the store's published theme and checkout pixel configuration (Shop ID `99646538009`, Theme ID `190590779673`):

1. **Google & YouTube Shopify App (Web Pixel ID `2943713561`)**:
   - Google Tag IDs: `G-JD6C3GXY26`, `AW-18302441675`, `GT-WBLSRCZV`.
   - Purchase Action Label: `AW-18302441675/84E2CLectMscEMuxpJdE`.
   - Runtime Context: Sandboxed Shopify Web Pixel on `checkout.theonvor.com`.
2. **Facebook & Instagram Shopify App (Web Pixel ID `2659811609`)**:
   - Pixel ID: `1261670659444600`.
   - Runtime Context: Sandboxed Shopify Web Pixel on `checkout.theonvor.com`.
3. **Judge.me Reviews App (Web Pixel ID `2837414169`)**:
   - Runtime Context: Sandboxed Shopify Web Pixel on `checkout.theonvor.com`.

### 4.3 Thank-You Page Purchase Execution
- **Confirmation Status**: **BLOCKED** (Completing a live financial order with real payment processing or COD on the active production store was not executed to prevent affecting live financial and inventory records).

---

## 5. Technical Consent & Privacy Management Architecture

A full technical consent management system has been implemented across `src/lib/analytics/consent.ts`, `AnalyticsProvider.tsx`, `attribution.ts`, and `CookieNotice.tsx`.

### 5.1 Architecture & Loading Rules

1. **Categorized Consent Model**:
   - **Strictly Necessary / Essential**: Always Active (`essential: true`). Required for cart token persistence, secure bag operations, and checkout redirect.
   - **Analytics & Performance**: Controls Google Analytics 4 (`G-JD6C3GXY26`) and Google Tag Manager.
   - **Marketing & Advertising**: Controls Meta Pixel (`1261670659444600`), Google Ads conversions (`AW-18302441675`), and TikTok Pixel.
2. **Google Consent Mode v2 Bootstrap**:
   - Before any Google scripts execute, inline script initializes:
     ```javascript
     gtag('consent', 'default', {
       'analytics_storage': 'denied',
       'ad_storage': 'denied',
       'ad_user_data': 'denied',
       'ad_personalization': 'denied'
     });
     ```
   - When Analytics consent is granted: updates `analytics_storage: 'granted'`.
   - When Marketing consent is granted: updates `ad_storage`, `ad_user_data`, `ad_personalization` to `'granted'`.
3. **Meta & TikTok Consent Synchronization**:
   - Meta Pixel script only mounts if Marketing consent is granted. On revocation, calls `fbq('consent', 'revoke')`.
   - TikTok Pixel script only mounts if Marketing consent is granted. Defaults to `ttq.holdConsent()`.
4. **Attribution Storage Gating**:
   - `onvor_attribution` cookie and `localStorage('onvor_attribution_first/last')` are **not written** before consent or if non-essential tracking is rejected.
5. **Reopening Consent Preferences**:
   - A permanent **"Cookie settings"** button is embedded in `Footer.tsx` triggering `onvor:open_consent_modal` so users can inspect and update their preferences at any time.

### 5.2 Automated Consent Verification Test Results

```text
[SCENARIO 1] First Visit - No Consent Decision
GA4 dataLayer events fired: 0
Meta Pixel fbq calls fired: 0
Attribution cookie written: false
Attribution localStorage written: false
PASS: Zero non-essential tracking executed before consent.

[SCENARIO 2] User Rejects Non-Essential
GA4 dataLayer events on add_to_cart: 0
Meta Pixel fbq calls on add_to_cart: 0
Attribution cookie present: false
PASS: Tracking completely suppressed after Reject Non-Essential.

[SCENARIO 3] User Clicks 'Accept All'
GA4 dataLayer events: 1
Meta Pixel fbq calls: 1
Attribution cookie present: true
PASS: GA4, Meta, and Attribution active after Accept All.

[SCENARIO 4] Custom Preferences - Analytics Only
GA4 dataLayer events: 1
Meta Pixel fbq calls: 0
PASS: GA4 active and Meta suppressed under Analytics Only.

[SCENARIO 5] Custom Preferences - Marketing Only
GA4 dataLayer events: 0
Meta Pixel fbq calls: 1
PASS: Meta active and GA4 suppressed under Marketing Only.
```

> **Legal Disclaimer / Jurisdictional Notice**: This implementation provides technical consent controls (script gating, Google Consent Mode v2, and preference persistence). It should be reviewed by the merchant’s legal counsel to ensure compliance with applicable regional statutes (GDPR, UK GDPR, CCPA/CPRA, etc.).

---

## 6. Final Production Verdict Table

| Area | Status | Evidence | Remaining Action |
| :--- | :---: | :--- | :--- |
| **Storefront Events** | **PASS** | `trackEvent` dispatches all 8 ecommerce events (`page_viewed`, `product_viewed`, `collection_viewed`, `search_submitted`, `product_added_to_cart`, `product_removed_from_cart`, `cart_viewed`, `checkout_started`, `customer_subscribed`) with complete typed item payloads and deduplication locks. | None. Operational in production. |
| **GA4 / GTM** | **NETWORK VERIFIED ONLY** | Outgoing requests to `https://www.googletagmanager.com/gtag/js` and `google-analytics.com/g/collect` with standard GA4 ecommerce payloads after Analytics consent. | Optional: Log into Google Analytics dashboard and confirm real-time events in DebugView. |
| **Meta Pixel** | **NETWORK VERIFIED ONLY** | Outgoing requests to `https://connect.facebook.net/en_US/fbevents.js` and `facebook.com/tr/` with `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Search`, `Lead` after Marketing consent. | Optional: Log into Meta Events Manager and verify Test Events tab. |
| **TikTok Pixel** | **NOT CONFIGURED** | Provider implementation exists in `src/lib/analytics/providers/tiktok.ts`. Script is not loaded when `NEXT_PUBLIC_TIKTOK_PIXEL_ID` is unset. | Set `NEXT_PUBLIC_TIKTOK_PIXEL_ID` in Vercel / `.env.local` when ready to activate. |
| **Shopify Web Pixels (Storefront)** | **ARCHITECTURAL LIMITATION** | `window.Shopify.analytics.publish` is a client shim; Monorail site abandonment is a manual beacon. Shopify Admin legacy Online Store session reports do not count headless traffic. | Acknowledge that GA4 and Meta are primary analytics sources for headless storefront traffic. |
| **Cart Attribution** | **PASS** | Captured attribution (`_utm_*`, `_gclid`, `_fbclid`, `_ttclid`, `_landing_page`, `_referrer`) is written to Shopify Cart Attributes via Storefront API `cartAttributesUpdate`. | None. Operational in production. |
| **Order Attribution** | **BLOCKED** | End-to-end cart attribute propagation is proven via Storefront API schema, but verifying `order.customAttributes` in Shopify Admin requires completing a real test purchase. | Place a live test order in Shopify Admin to inspect `order.customAttributes` and `landing_site_ref`. |
| **Purchase Tracking** | **BLOCKED** | Hosted checkout confirmation page is configured with Google App (`G-JD6C3GXY26`, `AW-18302441675`) and Meta App (`1261670659444600`), but thank-you page firing requires a live test purchase. | Verify `purchase` event firing on order completion during next live order or test checkout. |
| **Consent / Privacy** | **PASS (Technical Controls Implemented)** | Full technical Consent Preference Center implemented with Accept All, Reject Non-Essential, and Customization. Google Consent Mode v2 initialized with `denied` defaults; GA4/Meta scripts and attribution cookies are strictly blocked prior to consent. Permanent "Cookie settings" footer link enables changing preferences. | Review against business's specific legal/jurisdictional requirements. |
| **Secrets / Security** | **PASS** | All client bundles audited: zero Admin API tokens, private keys, or webhook secrets are exposed. `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is public-scoped read-only token. | None. |
