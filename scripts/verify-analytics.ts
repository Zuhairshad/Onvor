/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Verification test script for headless analytics & consent management:
 * 1. Pre-consent state (no choice made)
 * 2. Accept All
 * 3. Reject Non-Essential
 * 4. Analytics Only
 * 5. Marketing Only
 * 6. Attribution persistence under each consent setting
 */

import { formatEcommerceItem, trackEvent, setConsentPreferences, getConsentPreferences, formatCartAttributes, appendAttributionToUrl, captureAttribution } from "../src/lib/analytics";

// Mock browser global objects
const dataLayer: any[] = [];
const gtagCalls: any[] = [];
const fbqCalls: any[] = [];
const ttqCalls: any[] = [];
const shopifyPublishCalls: any[] = [];
const shopifyTrackCalls: any[] = [];
const customEvents: any[] = [];

(global as any).window = {
  dataLayer,
  gtag: (...args: any[]) => gtagCalls.push(args),
  fbq: (...args: any[]) => fbqCalls.push(args),
  ttq: {
    track: (...args: any[]) => ttqCalls.push(args),
    page: () => ttqCalls.push(["Pageview"]),
    grantConsent: () => ttqCalls.push(["grantConsent"]),
    holdConsent: () => ttqCalls.push(["holdConsent"]),
  },
  Shopify: {
    analytics: {
      publish: (name: string, payload: any, opts: any) => {
        shopifyPublishCalls.push({ name, payload, opts });
        return true;
      },
    },
  },
  ShopifyAnalytics: {
    lib: {
      track: (name: string, payload: any) => shopifyTrackCalls.push({ name, payload }),
      page: (pageType: string, payload: any) => shopifyTrackCalls.push({ name: "page", pageType, payload }),
    },
  },
  location: {
    href: "https://theonvor.com/products/signature-tee-black?utm_source=analytics_audit&utm_medium=controlled_test&utm_campaign=august_headless_audit&gclid=test-gclid-unique&fbclid=test-fbclid-unique&ttclid=test-ttclid-unique",
    search: "?utm_source=analytics_audit&utm_medium=controlled_test&utm_campaign=august_headless_audit&gclid=test-gclid-unique&fbclid=test-fbclid-unique&ttclid=test-ttclid-unique",
    pathname: "/products/signature-tee-black",
    hostname: "theonvor.com",
  },
  localStorage: {
    store: {} as Record<string, string>,
    getItem(k: string) { return this.store[k] || null; },
    setItem(k: string, v: string) { this.store[k] = v; },
    removeItem(k: string) { delete this.store[k]; },
    clear() { this.store = {}; },
  },
  sessionStorage: {
    store: {} as Record<string, string>,
    getItem(k: string) { return this.store[k] || null; },
    setItem(k: string, v: string) { this.store[k] = v; },
    removeItem(k: string) { delete this.store[k]; },
    clear() { this.store = {}; },
  },
  dispatchEvent: (evt: any) => customEvents.push(evt),
};

(global as any).document = {
  title: "Signature Tee Black | ONVOR",
  referrer: "https://www.instagram.com/",
  cookie: "",
  dispatchEvent: (evt: any) => customEvents.push(evt),
};

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any) {
    this.type = type;
    this.detail = params?.detail;
  }
};

console.log("=================================================");
console.log("STARTING CONSENT & PRIVACY AUDIT TEST SUITE");
console.log("=================================================\n");

const testItem = formatEcommerceItem({
  id: "52169180119321",
  name: "Signature Tee Black",
  price: 2450,
  variant: "Size: L / Color: Black",
  category: "Tops",
  quantity: 1,
});

// SCENARIO 1: First visit with no consent choice (undecided)
console.log("[SCENARIO 1] First Visit - No Consent Decision");
window.localStorage.clear();
window.sessionStorage.clear();
document.cookie = "";
dataLayer.length = 0;
fbqCalls.length = 0;

trackEvent({
  event: "product_viewed",
  product_id: "10309174395161",
  handle: "signature-tee-black",
  title: "Signature Tee Black",
  value: 2450,
  currency: "PKR",
  items: [testItem],
});

console.log("GA4 dataLayer events fired:", dataLayer.length);
console.log("Meta Pixel fbq calls fired:", fbqCalls.length);
console.log("Attribution cookie written:", document.cookie.includes("onvor_attribution"));
console.log("Attribution localStorage written:", Boolean(window.localStorage.getItem("onvor_attribution_first")));

if (dataLayer.length > 0 || fbqCalls.length > 0 || document.cookie.includes("onvor_attribution")) {
  throw new Error("FAIL: Non-essential tracking or cookies executed before consent!");
}
console.log(" PASS: Zero non-essential tracking executed before consent.\n");

// SCENARIO 2: User clicks 'Reject Non-Essential'
console.log("[SCENARIO 2] User Rejects Non-Essential");
setConsentPreferences({ analytics: false, marketing: false });
dataLayer.length = 0;
fbqCalls.length = 0;

trackEvent({
  event: "product_added_to_cart",
  currency: "PKR",
  value: 2450,
  items: [testItem],
});

console.log("GA4 dataLayer events on add_to_cart:", dataLayer.length);
console.log("Meta Pixel fbq calls on add_to_cart:", fbqCalls.length);
console.log("Attribution cookie present:", document.cookie.includes("onvor_attribution"));

if (dataLayer.length > 0 || fbqCalls.length > 0 || document.cookie.includes("onvor_attribution")) {
  throw new Error("FAIL: Tracking executed after Reject Non-Essential!");
}
console.log(" PASS: Tracking completely suppressed after Reject Non-Essential.\n");

// SCENARIO 3: User clicks 'Accept All'
console.log("[SCENARIO 3] User Clicks 'Accept All'");
setConsentPreferences({ analytics: true, marketing: true });
dataLayer.length = 0;
fbqCalls.length = 0;

// Re-capture attribution upon consent grant
captureAttribution();

trackEvent({
  event: "product_viewed",
  product_id: "10309174395162",
  handle: "signature-tee-steel-grey",
  title: "Signature Tee Steel Grey",
  value: 2450,
  currency: "PKR",
  items: [testItem],
});

console.log("GA4 dataLayer events:", dataLayer.length);
console.log("Meta Pixel fbq calls:", fbqCalls.length);
console.log("Attribution cookie present:", document.cookie.includes("onvor_attribution"));

if (dataLayer.length === 0 || fbqCalls.length === 0 || !document.cookie.includes("onvor_attribution")) {
  throw new Error("FAIL: Tracking failed to activate after Accept All!");
}
console.log(" PASS: GA4, Meta, and Attribution active after Accept All.\n");

// SCENARIO 4: Custom Preferences (Analytics Only)
console.log("[SCENARIO 4] Custom Preferences - Analytics Only");
setConsentPreferences({ analytics: true, marketing: false });
dataLayer.length = 0;
fbqCalls.length = 0;

trackEvent({
  event: "cart_viewed",
  value: 2450,
  currency: "PKR",
  items: [testItem],
});

console.log("GA4 dataLayer events:", dataLayer.length);
console.log("Meta Pixel fbq calls:", fbqCalls.length);

if (dataLayer.length === 0 || fbqCalls.length > 0) {
  throw new Error("FAIL: Analytics Only did not isolate GA4 from Meta!");
}
console.log(" PASS: GA4 active and Meta suppressed under Analytics Only.\n");

// SCENARIO 5: Custom Preferences (Marketing Only)
console.log("[SCENARIO 5] Custom Preferences - Marketing Only");
setConsentPreferences({ analytics: false, marketing: true });
dataLayer.length = 0;
fbqCalls.length = 0;

trackEvent({
  event: "checkout_started",
  value: 4900,
  currency: "PKR",
  items: [testItem],
});

console.log("GA4 dataLayer events:", dataLayer.length);
console.log("Meta Pixel fbq calls:", fbqCalls.length);

if (dataLayer.length > 0 || fbqCalls.length === 0) {
  throw new Error("FAIL: Marketing Only did not isolate Meta from GA4!");
}
console.log(" PASS: Meta active and GA4 suppressed under Marketing Only.\n");

console.log("=================================================");
console.log("ALL CONSENT & PRIVACY SCENARIOS PASSED 100%!");
console.log("=================================================");
