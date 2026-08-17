import { sendShopifyPageView } from "../shopify-monorail";
import type { AnalyticsEvent } from "../types";

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    if (event.event === "page_viewed") {
      sendShopifyPageView({
        url: event.page_location,
        referrer: document.referrer || "",
        pageType: event.page_type,
        resourceId: null,
        customerId: null,
      });
    }

    // Custom DOM events for any remaining app listeners
    document.dispatchEvent(new CustomEvent(`shopify:${event.event}`, { detail: event }));
  } catch (err) {
    console.debug("[Shopify Analytics Dispatch Notice]", err);
  }
}
