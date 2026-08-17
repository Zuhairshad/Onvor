import { initShopifySessionCookies } from "../shopify-monorail";
import type { AnalyticsEvent } from "../types";

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    if (event.event === "page_viewed") {
      // Ensure session cookies are set on .theonvor.com so checkout can read them
      initShopifySessionCookies();

      // Publish through Shopify's Web Pixels Manager (loaded by ShopifyWebPixels component).
      // The manager's built-in analytics records this as a session in Shopify Analytics.
      const analytics = (window.Shopify as Record<string, unknown> | undefined)?.["analytics"] as
        | { publish: (type: string, payload: Record<string, unknown>) => void }
        | undefined;

      analytics?.publish("page_viewed", {
        url: event.page_location,
        referrer: document.referrer || "",
        pageType: event.page_type ?? "home",
        resourceId: null,
      });
    }

    document.dispatchEvent(new CustomEvent(`shopify:${event.event}`, { detail: event }));
  } catch (err) {
    console.debug("[Shopify Analytics]", err);
  }
}
