import type { AnalyticsEvent } from "../types";

// Shopify's internal Monorail endpoint (/cdn/shop/monorail/unstable/produce_batch)
// blocks cross-origin POST requests from external headless domains (Allow: OPTIONS, GET, HEAD only).
// Storefront session tracking for headless stores goes through GA4 and Meta Pixel instead.
// Cart-level attribution (UTM params) is passed to Shopify orders via cartAttributesUpdate.
export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  // Custom DOM events — used by any remaining Shopify app listeners on the page
  document.dispatchEvent(new CustomEvent(`shopify:${event.event}`, { detail: event }));
}
