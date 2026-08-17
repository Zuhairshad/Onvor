import { sendShopifyPageView } from "../shopify-monorail";
import type { AnalyticsEvent } from "../types";

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    const eventName = event.event;

    // Send real page_view events to Shopify's headless Monorail endpoint.
    // This is what actually records sessions in the Shopify Analytics dashboard.
    if (event.event === "page_viewed") {
      sendShopifyPageView({
        url: event.page_location,
        referrer: document.referrer || "",
        pageType: event.page_type,
        resourceId: null,
        customerId: null,
      });
    }

    // Dispatch to Web Pixels Manager queue (used by Shopify Flow / app integrations)
    if (window.Shopify?.analytics?.publish) {
      window.Shopify.analytics.publish(eventName, event, { timestamp: Date.now() });
    }

    // Custom DOM events for local app listeners (Pushbots, Forms, etc.)
    document.dispatchEvent(new CustomEvent(`shopify:${eventName}`, { detail: event }));
  } catch (err) {
    console.debug("[Shopify Analytics Dispatch Notice]", err);
  }
}
