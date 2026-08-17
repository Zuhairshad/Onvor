import { initShopifySessionCookies } from "../shopify-monorail";
import type { AnalyticsEvent } from "../types";

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    // Ensure _shopify_y / _shopify_s cookies exist and are scoped to .theonvor.com
    // so Shopify's checkout at checkout.theonvor.com can read them and record sessions.
    if (event.event === "page_viewed") {
      initShopifySessionCookies();
    }

    document.dispatchEvent(new CustomEvent(`shopify:${event.event}`, { detail: event }));
  } catch (err) {
    console.debug("[Shopify Analytics]", err);
  }
}
