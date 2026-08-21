# Headless Shopify + Next.js Analytics Setup Guide

**Store:** ONVOR (theonvor.com)  
**Stack:** Next.js App Router · Shopify headless (checkout.theonvor.com) · GA4 · Meta Pixel · Shopify Web Pixels Manager  
**Date documented:** August 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Consent System](#2-consent-system)
3. [GA4 — The Critical Setup](#3-ga4--the-critical-setup)
4. [AnalyticsProvider Component](#4-analyticsprovider-component)
5. [Event Tracking Map](#5-event-tracking-map)
6. [Shopify Web Pixels Manager (WPM)](#6-shopify-web-pixels-manager-wpm)
7. [Shopify Trekkie / Monorail](#7-shopify-trekkie--monorail)
8. [API Proxy Route](#8-api-proxy-route)
9. [Known Limitations](#9-known-limitations)
10. [Debugging Checklist](#10-debugging-checklist)

---

## 1. Architecture Overview

```
Browser
  │
  ├─► AnalyticsProvider (always mounted in root layout)
  │     ├─ GA4 scripts — always loaded, consent mode controls hit type
  │     ├─ Meta Pixel — loaded only after marketing consent
  │     ├─ TikTok Pixel — loaded only after marketing consent
  │     └─ RouteChangeListener — fires trackEvent("page_viewed") on navigation
  │
  ├─► ShopifyWebPixels (always mounted)
  │     └─ WPM bundle — handles pixel sandboxes (Meta, Judge.me, Pushbot, shopify-app-pixel)
  │
  └─► trackEvent() — master dispatcher in src/lib/analytics/index.ts
        ├─ emitShopifyAnalytics() — always (essential, no consent gate)
        │   ├─ sendShopifyPageView() → /api/shopify-analytics → monorail
        │   └─ window.Shopify.analytics.publish("page_viewed", {}) → WPM
        ├─ emitGA4() — only when consent.decided && consent.analytics
        ├─ emitMeta() — only when consent.decided && consent.marketing
        └─ emitTikTok() — only when consent.decided && consent.marketing

/api/shopify-analytics (Next.js route handler)
  └─► POST checkout.theonvor.com/.well-known/shopify/monorail/unstable/produce_batch
```

**Why headless complicates everything:**
- Shopify Analytics is designed for Liquid (native) storefronts. Headless stores must manually replicate what Shopify's Liquid theme does automatically: session cookies, trekkie page view events, WPM initialization.
- GA4 loads via Next.js `Script` component, not GTM — the `gtag()` function must be defined correctly or GA4 silently drops all events.
- Consent must be set before GA4 loads, without relying on React's async effect timing.

---

## 2. Consent System

**File:** `src/lib/analytics/consent.ts`

Consent is stored in `localStorage` under the key `onvor_consent_preferences`:

```json
{
  "essential": true,
  "analytics": true,
  "marketing": false,
  "decided": true,
  "timestamp": 1234567890
}
```

The `subscribeConsent` / `getConsentPreferences` functions expose this via `useSyncExternalStore` so components re-render when consent changes.

**Server snapshot** (the critical part):

```ts
const SERVER_CONSENT_SNAPSHOT: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  decided: false,
  timestamp: 0,
};
```

React uses this on the server and during the first client hydration tick. **Never use this snapshot to set GA4 consent** — by the time any `useEffect` fires, GA4 may already be loaded and you would have pushed `denied` to dataLayer for a user who already accepted.

The correct approach: read `localStorage` synchronously inside the inline init script (see Section 3).

---

## 3. GA4 — The Critical Setup

### 3.1 The `arguments` bug — the most important thing in this guide

GA4's dataLayer processor only handles **`Arguments` objects** (the pseudo-array from the `arguments` keyword). It does **not** handle plain JavaScript arrays.

**Wrong — silently breaks everything:**
```js
function gtag(...args) {
  window.dataLayer.push(args);  // pushes a plain Array — GA4 ignores it
}
// OR
window.gtag = (...args) => window.dataLayer.push(args);
```

**Correct — Google's exact implementation:**
```js
function gtag() {
  window.dataLayer.push(arguments);  // pushes an Arguments object — GA4 processes it
}
window.gtag = gtag;
```

**Symptoms of the wrong pattern:**
- `gtag.js` loads (200 from disk cache), no errors in console
- `window.google_tag_data` exists but `ics.entries` shows `{implicit: true}`, `usedDefault: false`, `usedUpdate: false`
- Zero `g/collect` network requests — GA4 receives no data whatsoever
- No `_ga` cookie set

**How to verify it's right:**
```js
// Run in DevTools console:
window.google_tag_data.ics.entries
// Should show: { "G-XXXXXXXX": { analytics_storage: "granted", ... } }
// NOT: { "G-XXXXXXXX": { implicit: true } }
```

### 3.2 Consent must be set synchronously, before GA4 loads

The wrong approach (using `useEffect`):
- React hydration gives `useSyncExternalStore` the server snapshot (`decided: false, analytics: false`) on first render
- `useEffect` fires with these stale values
- `gtag('consent', 'default', { analytics_storage: 'denied' })` gets pushed
- GA4 receives `denied` even for users who consented weeks ago

The correct approach: read `localStorage` **synchronously** in the inline Script, before GA4 even loads:

```js
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;

var _c = {};
try { _c = JSON.parse(localStorage.getItem('onvor_consent_preferences') || '{}'); } catch(e) {}
var _analytics = !!(_c.decided && _c.analytics);
var _marketing = !!(_c.decided && _c.marketing);

gtag('consent', 'default', {
  analytics_storage: _analytics ? 'granted' : 'denied',
  ad_storage: _marketing ? 'granted' : 'denied',
  ad_user_data: _marketing ? 'granted' : 'denied',
  ad_personalization: _marketing ? 'granted' : 'denied'
});

gtag('js', new Date());
gtag('config', 'G-XXXXXXXX');
```

This runs before any React effects, so consent is always accurate.

### 3.3 Always load GA4 — never gate it on consent

**Wrong:**
```tsx
{consent.decided && consent.analytics && (
  <Script src="gtag/js..." />
)}
```

**Why it's wrong:** GA4 loads late (after React hydration + re-render), causing race conditions. Consent mode handles the hit-type differentiation automatically — denied users get cookieless pings, not full tracking.

**Correct:** Always render the GA4 scripts. Let consent mode decide what gets sent.

---

## 4. AnalyticsProvider Component

**File:** `src/components/analytics/AnalyticsProvider.tsx`

```tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useSyncExternalStore } from "react";
import Script from "next/script";
import {
  captureAttribution, getConsentPreferences, subscribeConsent,
  trackEvent, type ConsentPreferences
} from "@/lib/analytics";
import { sendShopifyPageView } from "@/lib/analytics/shopify-monorail";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-JD6C3GXY26";
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || "AW-18302441675";
const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID || "GT-WBLSRCZV";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1261670659444600";
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

// Must match the key used in src/lib/analytics/consent.ts
const CONSENT_KEY = "onvor_consent_preferences";

const SERVER_CONSENT_SNAPSHOT: ConsentPreferences = {
  essential: true, analytics: false, marketing: false, decided: false, timestamp: 0,
};
function getServerConsentSnapshot() { return SERVER_CONSENT_SNAPSHOT; }

function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttribution();

    let pageType = "page";
    if (pathname === "/") pageType = "home";
    else if (pathname.startsWith("/products/")) pageType = "product";
    else if (pathname.startsWith("/collections/")) pageType = "collection";
    else if (pathname.startsWith("/cart")) pageType = "cart";
    else if (pathname.startsWith("/search")) pageType = "search";
    else if (pathname.startsWith("/policies/")) pageType = "policy";

    trackEvent({
      event: "page_viewed",
      page_title: document.title || "ONVOR",
      page_location: window.location.href,
      page_path: pathname,
      page_type: pageType,
    });

    // Session heartbeat — keeps Shopify Analytics session alive on long page stays
    const heartbeat = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      sendShopifyPageView({
        url: window.location.href,
        referrer: document.referrer || "",
        pageType,
        resourceId: null,
        customerId: null,
      });
    }, 2 * 60 * 1000); // every 2 minutes

    return () => clearInterval(heartbeat);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  const consent = useSyncExternalStore(
    subscribeConsent, getConsentPreferences, getServerConsentSnapshot
  );

  useEffect(() => { captureAttribution(); }, [consent]);

  // Propagate consent changes to GA4 after it has loaded.
  // Consent DEFAULT is handled in the inline script below — this only sends UPDATE.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });
  }, [consent.analytics, consent.marketing]);

  const canLoadMeta = consent.decided && consent.marketing;
  const canLoadTikTok = consent.decided && consent.marketing && Boolean(TIKTOK_PIXEL_ID);

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

      {GA4_ID && (
        <>
          <Script
            id="google-gtag"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script
            id="google-gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                window.gtag = gtag;
                var _c = {};
                try { _c = JSON.parse(localStorage.getItem('${CONSENT_KEY}') || '{}'); } catch(e) {}
                var _analytics = !!(_c.decided && _c.analytics);
                var _marketing = !!(_c.decided && _c.marketing);
                gtag('consent', 'default', {
                  analytics_storage: _analytics ? 'granted' : 'denied',
                  ad_storage: _marketing ? 'granted' : 'denied',
                  ad_user_data: _marketing ? 'granted' : 'denied',
                  ad_personalization: _marketing ? 'granted' : 'denied'
                });
                gtag('js', new Date());
                gtag('config', '${GA4_ID}');
                ${GADS_ID ? `if (_marketing) gtag('config', '${GADS_ID}', { send_page_view: false });` : ""}
                ${GTAG_ID && GTAG_ID !== GA4_ID ? `gtag('config', '${GTAG_ID}', { send_page_view: false });` : ""}
              `,
            }}
          />
        </>
      )}

      {/* Meta Pixel — only after marketing consent */}
      {canLoadMeta && META_PIXEL_ID && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('consent', 'grant');
            `,
          }}
        />
      )}

      {/* TikTok Pixel — only after marketing consent */}
      {canLoadTikTok && TIKTOK_PIXEL_ID && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                /* ... standard TikTok snippet ... */
                ttq.load('${TIKTOK_PIXEL_ID}');
                ttq.grantConsent();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
```

**Key design decisions:**
- `RouteChangeListener` is wrapped in `<Suspense>` because `useSearchParams()` requires it in App Router
- GA4 scripts use `strategy="afterInteractive"` — they load after hydration but the inline init script sets consent synchronously from localStorage
- GADS and GTAG use `send_page_view: false` to prevent duplicate page_view hits (GA4 auto-fires one; our `emitGA4` fires the second via `window.gtag("event", "page_view", ...)`)

---

## 5. Event Tracking Map

**File:** `src/lib/analytics/index.ts` → `trackEvent(event: AnalyticsEvent)`

All custom events flow through `trackEvent()`. It gates providers by consent and deduplicates within 500ms windows.

| Our Event | GA4 Event | Meta Event | Notes |
|-----------|-----------|------------|-------|
| `page_viewed` | `page_view` | `PageView` | Always fires (essential). Also sends trekkie to Shopify. |
| `product_viewed` | `view_item` | `ViewContent` | Requires analytics consent for GA4 |
| `collection_viewed` | `view_item_list` | — | |
| `search_submitted` | `search` | — | |
| `product_added_to_cart` | `add_to_cart` | `AddToCart` | |
| `product_removed_from_cart` | `remove_from_cart` | — | |
| `cart_viewed` | `view_cart` | — | |
| `checkout_started` | `begin_checkout` | `InitiateCheckout` | Checkout happens on checkout.theonvor.com |
| `customer_subscribed` | `generate_lead` | `Lead` | Newsletter / email capture |
| `contact_submitted` | `contact` | — | Contact form |

**GA4 also pushes to dataLayer** for GTM consumption:
- Every `gtag("event", ...)` call is mirrored with `dataLayer.push({event: ..., ecommerce: ...})`

**Deduplication:** `src/lib/analytics/deduplication.ts` — 500ms window per event signature. Prevents double-fires on rapid navigation or React StrictMode double-invocation.

---

## 6. Shopify Web Pixels Manager (WPM)

**File:** `src/components/integrations/ShopifyWebPixels.tsx`

WPM is Shopify's sandboxed pixel runner. It hosts Meta Pixel, Judge.me, and `shopify-app-pixel` (the internal pixel that records Shopify Analytics sessions). In a native Liquid store, WPM is initialized automatically. In headless, you must do it yourself.

### 6.1 Finding the WPM bundle URL

1. Go to `checkout.theonvor.com` (the Liquid store)
2. View source
3. Search for `wpm/b` — find the hashed bundle URL
4. Copy it. The hash changes when Shopify updates WPM (~monthly). Update `BUNDLE_URL` in `ShopifyWebPixels.tsx` when that happens.

Current URL pattern: `https://checkout.theonvor.com/cdn/wpm/b{hash}.js`

### 6.2 The `async=false` requirement

WPM's internal `il()` function reads its config from `document.currentScript.dataset` at the moment the bundle executes. If the script is `async`, `document.currentScript` is `null` when the script runs, so WPM uses fallback defaults — resulting in `shop_id: -1` and sessions never attributed.

```js
// Wrong — currentScript is null when async script executes
s.async = true;

// Correct — executes inline so currentScript points to this element
s.async = false;
s.dataset.shopId = "99646538009";
s.dataset.storefrontBaseUrl = "https://checkout.theonvor.com";
s.dataset.monorailEndpoint = "https://checkout.theonvor.com/...";
s.dataset.surface = "storefront-renderer";
s.dataset.isMerchantRequest = "false";
s.dataset.enabledBetaFlags = JSON.stringify(["d5bdd5d0", "656605ce"]);
```

### 6.3 Customer Privacy API bridge

WPM and STRICT-mode pixels (shopify-app-pixel, TikTok) call methods on `window.Shopify.customerPrivacy` to check whether they can track the visitor. Without this stub, WPM logs `customer_privacy_api_events` failures:

```js
window.Shopify.customerPrivacy = {
  userCanBeTracked: () => {
    const c = getConsentPreferences();
    return !c.decided || c.analytics;  // essential tracking before decision
  },
  currentVisitorConsent: () => {
    const c = getConsentPreferences();
    return {
      analytics: c.analytics ? "yes" : "no",
      marketing: c.marketing ? "yes" : "no",
      preferences: "no",
      sale_of_data: "no",
    };
  },
  setTrackingConsent: (_, cb) => cb?.(),
  shouldShowBanner: () => false,
  shouldShowGDPRBanner: () => false,
  shouldShowCCPAOptOut: () => false,
  // Next.js doesn't emit Server-Timing headers — return null to prevent WPM failure event
  navigationServerTiming: () => null,
};
```

### 6.4 The replay queue

WPM pixels load asynchronously. Any `publish()` calls before WPM initializes must be queued and replayed after init:

```js
// Pre-init stub
const replayQueue = [];
window.Shopify.analytics = {
  replayQueue,
  publish: (e, r, o) => { replayQueue.push([e, r, o]); return true; },
};

// After WPM loads
const instance = webPixelsManager.init(WPM_CONFIG);
window.Shopify.analytics.publish = instance.publish;

// Drain queue with delay — pixel workers need time to register subscribers
setTimeout(() => {
  queue.forEach(([e, r, o]) => instance.publish(e, r, o));
}, 500);
```

### 6.5 webPixelsConfigList

This array must match what Shopify has installed in your store. Get it from the Liquid store's source:

```js
webPixelsConfigList: [
  // Facebook/Meta Pixel — OPEN context (no consent gate in WPM)
  { id: "3071443225", configuration: '{"pixel_id":"1261670659444600","pixel_type":"facebook_pixel"}',
    runtimeContext: "OPEN", type: "APP", apiClientId: 2329312,
    privacyPurposes: ["ANALYTICS", "MARKETING", "SALE_OF_DATA"] },

  // Shopify's internal analytics pixel — DO NOT REMOVE
  { id: "shopify-app-pixel", configuration: "{}",
    runtimeContext: "STRICT", scriptVersion: "0510",
    apiClientId: "shopify-pixel", type: "APP",
    privacyPurposes: ["ANALYTICS", "MARKETING"] },

  // Custom pixels (if any)
  { id: "shopify-custom-pixel", runtimeContext: "LAX",
    scriptVersion: "0510", apiClientId: "shopify-pixel", type: "CUSTOM",
    privacyPurposes: ["ANALYTICS", "MARKETING"] },
]
```

**Do not include the Google pixel** — it crashes WPM in headless with `TypeError: Cannot read properties of undefined (reading 'find')`.

### 6.6 Triggering WPM from trackEvent

In `emitShopifyAnalytics()`, after sending the trekkie page view, also publish through WPM:

```js
const analytics = window.Shopify?.analytics;
analytics?.publish("page_viewed", {});
```

This fires the `shopify-app-pixel` subscriber which records the session in Shopify Analytics.

---

## 7. Shopify Trekkie / Monorail

**Files:**
- `src/lib/analytics/shopify-monorail.ts` — session cookies + trekkie payload
- `src/lib/analytics/providers/shopify.ts` — called from trackEvent

### 7.1 Session cookies

Shopify identifies visitors and sessions via two cookies on the **root domain** (`.theonvor.com`) so `checkout.theonvor.com` can read them:

| Cookie | Purpose | Duration |
|--------|---------|---------|
| `_shopify_y` | Visitor (unique user) token | 1 year |
| `_shopify_s` | Session token | 30 minutes (rolling) |

```js
document.cookie = `_shopify_y=${uuid}; Path=/; Domain=.theonvor.com; Max-Age=31536000; SameSite=Lax`;
document.cookie = `_shopify_s=${uuid}; Path=/; Domain=.theonvor.com; Max-Age=1800; SameSite=Lax`;
```

`initShopifySessionCookies()` creates these if missing and refreshes `_shopify_s` on every page view.

### 7.2 The trekkie event schema

Shopify Analytics reads `trekkie_storefront_page_view/1.4` events from monorail:

```json
{
  "schema_id": "trekkie_storefront_page_view/1.4",
  "payload": {
    "appClientId": "580111",
    "shopId": 99646538009,
    "pageType": "home",
    "url": "https://www.theonvor.com/",
    "path": "/",
    "referrer": "",
    "title": "ONVOR",
    "currency": "PKR",
    "contentLanguage": "en",
    "uniqToken": "<_shopify_y value>",
    "visitToken": "<_shopify_s value>",
    "microSessionId": "<uuid>",
    "microSessionCount": 1,
    "isPersistentCookie": true,
    "isMerchantRequest": false,
    "hydrogenSubchannelId": "0"
  },
  "metadata": {
    "event_created_at_ms": 1234567890,
    "event_sent_at_ms": 1234567890
  }
}
```

**Critical:** `appClientId: "580111"` is the **Online Store channel** client ID. Using the headless channel ID (`"12875497473"`) routes sessions to a separate bucket that doesn't appear in Shopify Analytics.

### 7.3 Where to find your shop's appClientId

In the Liquid store source, search for `appClientId` in the `<script>` tag that initializes Trekkie. It will be a string like `"580111"`. Use that value.

### 7.4 Session heartbeat

Long page visits (e.g., reading a product page for 5 minutes) would lose the session without a heartbeat. `RouteChangeListener` sets a 2-minute interval that refreshes the trekkie page view while the tab is visible:

```js
const heartbeat = setInterval(() => {
  if (document.visibilityState !== "visible") return;
  sendShopifyPageView({ url, referrer, pageType, ... });
}, 2 * 60 * 1000);
return () => clearInterval(heartbeat);
```

---

## 8. API Proxy Route

**File:** `src/app/api/shopify-analytics/route.ts`

Browser `fetch()` to monorail would be cross-origin and blocked. The proxy forwards the request server-side (same-origin from Vercel edge → Shopify):

```
Browser → POST /api/shopify-analytics → Vercel → POST checkout.theonvor.com/.well-known/shopify/monorail/unstable/produce_batch
```

The route forwards these headers: `Cookie`, `User-Agent`, `Origin`, `Referer`, `Accept-Language`, `X-Forwarded-For`.

**Verifying it works:** The route returns `{ shopifyStatus: 200 }`. Open DevTools Network, filter by `shopify-analytics`, and check the response. Shopify returns `200` for valid payloads.

---

## 9. Known Limitations

### Shopify Live View (Sessions counter)

Shopify Live View is fundamentally designed for Liquid storefronts. The `trekkie_storefront_page_view` events do register sessions in **Shopify Analytics → Sessions** (visible after the standard 4-hour reporting delay), but **Live View** (the real-time counter on the Analytics overview page) behaves inconsistently for headless sessions.

The checkout pages (`checkout.theonvor.com`) do appear in Live View because they run on Shopify's native platform.

**What works reliably:**
- GA4 Realtime → shows active users in real time ✓
- Shopify Analytics → Sessions → shows after 4-hour delay ✓
- Shopify Live View → unreliable for headless storefront pages

### Pushbot pixel (`is_valid_event: false`)

Pixel ID `2948202777` is a Pushbot (push notifications app) STRICT-mode pixel. It logs `is_valid_event: false` for WPM events because Pushbot's STRICT pixel expects specific headless event context it doesn't receive. This does not affect GA4, Meta Pixel, or any other analytics. It is a cosmetic console warning from Pushbot's own pixel.

### GADS requires marketing consent

Google Ads (`AW-18302441675`) is initialized only when `_marketing` is true (line in the inline script: `if (_marketing) gtag('config', '${GADS_ID}', ...)`). Users who decline marketing consent won't have conversion tracking, which is correct per GDPR.

---

## 10. Debugging Checklist

### Layer 1: Is GA4 receiving data?

```js
// DevTools console — run on your site
window.google_tag_data.ics.entries
```

- **Good:** `{ "G-XXXXXXXX": { analytics_storage: "granted", ... } }`
- **Bad:** `{ "G-XXXXXXXX": { implicit: true } }` → `arguments` bug, gtag stub is wrong

Check network tab, filter by `g/collect`:
- 200/204 responses → GA4 is receiving data
- Zero results → gtag is broken (most likely the `arguments` bug)

Check for `_ga` cookie in Application → Cookies:
- Present → GA4 initialized correctly with analytics consent
- Missing → consent is `denied` or gtag is broken

### Layer 2: Is consent correct?

```js
// DevTools console
JSON.parse(localStorage.getItem('onvor_consent_preferences'))
// Should show: { decided: true, analytics: true/false, marketing: true/false }

window.google_tag_data.ics.entries
// Compare analytics_storage value against the consent above
```

### Layer 3: Is Shopify Analytics receiving sessions?

```js
// DevTools Network — filter by "shopify-analytics"
// POST /api/shopify-analytics should return:
{ "shopifyStatus": 200 }
```

If `shopifyStatus` is not 200:
- Check the payload — `shopId` must be a number (not string)
- Check `appClientId` — must be `"580111"` (string)
- Check cookie domain — `Domain=.theonvor.com` (with leading dot)

### Layer 4: Is WPM working?

```js
window.Shopify.analytics.initialized // should be true after WPM loads
window.Shopify.analytics.replayQueue // should be [] (empty, drained)
```

Check DevTools Network for requests to `extensions.shopifycdn.com/cdn/shopifycloud/web-pixels-manager` — these are the pixel sandboxes loading.

Check for `produce_batch` requests going directly to `checkout.theonvor.com` (WPM sends these in addition to our proxy route).

### Layer 5: Are e-commerce events firing?

```js
// DevTools console — enable verbose logging
window.dataLayer
// Look for push entries with { event: "view_item" }, { event: "add_to_cart" }, etc.
```

Or use GA4 DebugView:
1. Enable GA4 Debug Mode: `gtag('config', 'G-XXXXXXXX', { debug_mode: true })`
2. Open GA4 Admin → DebugView
3. Perform actions on the site — events appear in real time

### Common errors and fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Zero `g/collect` requests | `arguments` bug in gtag stub | Use `function gtag(){dataLayer.push(arguments);}` |
| `consent default = denied` | `useEffect` firing with server snapshot | Read localStorage in inline script, not in useEffect |
| `shop_id: -1` in WPM events | `async=true` on WPM script | Set `s.async = false` |
| WPM `customer_privacy_api_events` failure | Missing `window.Shopify.customerPrivacy` | Add Customer Privacy API bridge |
| Google pixel crash in WPM | Google pixel in `webPixelsConfigList` | Remove Google pixel from the config |
| `shopifyStatus` not 200 | Wrong `appClientId` or `shopId` | Use `"580111"` and `99646538009` (number) |
| Events fire twice | Missing deduplication | Check `shouldEmitEvent()` in `deduplication.ts` |
| GA4 loads late / consent race | GA4 gated on `consent.decided` | Always load GA4; use consent mode |

---

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_GA4_ID` | `G-JD6C3GXY26` | GA4 Measurement ID |
| `NEXT_PUBLIC_GADS_ID` | `AW-18302441675` | Google Ads conversion tag |
| `NEXT_PUBLIC_GTAG_ID` | `GT-WBLSRCZV` | Google Tag (links GA4 + Ads) |
| `NEXT_PUBLIC_META_PIXEL_ID` | `1261670659444600` | Meta/Facebook Pixel |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | *(unset)* | TikTok Pixel (optional) |

---

## File Reference

| File | Purpose |
|------|---------|
| `src/components/analytics/AnalyticsProvider.tsx` | GA4/Meta/TikTok scripts + route change listener |
| `src/components/integrations/ShopifyWebPixels.tsx` | WPM initialization |
| `src/lib/analytics/index.ts` | `trackEvent()` master dispatcher |
| `src/lib/analytics/consent.ts` | Consent state management (localStorage) |
| `src/lib/analytics/deduplication.ts` | 500ms event deduplication |
| `src/lib/analytics/attribution.ts` | UTM parameter capture |
| `src/lib/analytics/shopify-monorail.ts` | Session cookies + trekkie page view |
| `src/lib/analytics/providers/ga4.ts` | GA4 event emitter |
| `src/lib/analytics/providers/meta.ts` | Meta Pixel event emitter |
| `src/lib/analytics/providers/tiktok.ts` | TikTok Pixel event emitter |
| `src/lib/analytics/providers/shopify.ts` | Shopify Analytics event emitter |
| `src/app/api/shopify-analytics/route.ts` | Monorail proxy (CORS bypass) |
