import type { AnalyticsEvent } from "../types";

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    const eventName = event.event;

    // 1. Shopify Web Pixels Manager
    if (window.Shopify?.analytics?.publish) {
      window.Shopify.analytics.publish(eventName, event, { timestamp: Date.now() });
    }

    // 2. Trekkie / ShopifyAnalytics
    if (window.ShopifyAnalytics?.lib) {
      if (eventName === "page_viewed" && window.ShopifyAnalytics.lib.page) {
        window.ShopifyAnalytics.lib.page(event.page_type, {
          path: event.page_path,
          url: event.page_location,
        });
      } else if (window.ShopifyAnalytics.lib.track) {
        window.ShopifyAnalytics.lib.track(eventName, event);
      }
    } else if (window.__TREKKIE_SHIM_QUEUE) {
      window.__TREKKIE_SHIM_QUEUE.push({
        from: "headless-app",
        method: eventName === "page_viewed" ? "page" : "track",
        args: [eventName, event],
      });
    }

    // 3. Custom DOM Event for custom listeners (Pushbots / App hooks)
    const customEvent = new CustomEvent(`shopify:${eventName}`, { detail: event });
    document.dispatchEvent(customEvent);
  } catch (err) {
    console.debug("[Shopify Analytics Dispatch Notice]", err);
  }
}
