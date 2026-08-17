import { initShopifySessionCookies, sendShopifyPageView } from "../shopify-monorail";
import type { AnalyticsEvent } from "../types";

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    if (event.event === "page_viewed") {
      // Ensure session cookies exist on .theonvor.com for checkout attribution
      initShopifySessionCookies();

      // Direct trekkie_storefront_page_view → Shopify Analytics session recording.
      // This is the primary path for Shopify Analytics live visitors / session counts.
      sendShopifyPageView({
        url: event.page_location ?? window.location.href,
        referrer: document.referrer || "",
        pageType: event.page_type ?? "home",
        resourceId: null,
        customerId: null,
      });

      // Also publish through WPM so pixel subscribers (Meta, TikTok, etc.) receive it.
      const analytics = (window.Shopify as Record<string, unknown> | undefined)?.["analytics"] as
        | { publish: (e: string, p: Record<string, unknown>) => void }
        | undefined;
      analytics?.publish("page_viewed", {});
    }

    document.dispatchEvent(new CustomEvent(`shopify:${event.event}`, { detail: event }));
  } catch (err) {
    console.debug("[Shopify Analytics]", err);
  }
}
