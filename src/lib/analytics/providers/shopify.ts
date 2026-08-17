import { initShopifySessionCookies } from "../shopify-monorail";
import type { AnalyticsEvent } from "../types";

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    if (event.event === "page_viewed") {
      // Ensure session cookies exist on .theonvor.com for checkout attribution
      initShopifySessionCookies();

      // Publish through Shopify's Web Pixels Manager (loaded by ShopifyWebPixels).
      // The shopify-app-pixel inside WPM records this as a session in Shopify Analytics.
      const analytics = (window.Shopify as Record<string, unknown> | undefined)?.["analytics"] as
        | { publish: (e: string, p: Record<string, unknown>) => void }
        | undefined;

      // WPM automatically adds document.location and referrer via event context.
      // Passing custom fields (pageType, resourceId) causes the Google WPM pixel
      // to call .find() on an undefined field and fail.
      analytics?.publish("page_viewed", {});
    }

    document.dispatchEvent(new CustomEvent(`shopify:${event.event}`, { detail: event }));
  } catch (err) {
    console.debug("[Shopify Analytics]", err);
  }
}
