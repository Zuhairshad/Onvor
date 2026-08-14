import { captureAttribution } from "./attribution";
import { getConsentPreferences } from "./consent";
import { shouldEmitEvent } from "./deduplication";
import { emitGA4 } from "./providers/ga4";
import { emitMeta } from "./providers/meta";
import { emitShopifyAnalytics } from "./providers/shopify";
import { emitTikTok } from "./providers/tiktok";
import type { AnalyticsEvent, EcommerceItem } from "./types";

export * from "./types";
export * from "./attribution";
export * from "./deduplication";
export * from "./consent";

/**
 * Helper to construct an EcommerceItem with consistent formatting.
 */
export function formatEcommerceItem(params: {
  id: string;
  name: string;
  price: number | string;
  variant?: string;
  category?: string;
  quantity?: number;
  currency?: string;
}): EcommerceItem {
  const numericPrice = typeof params.price === "string" ? parseFloat(params.price) || 0 : params.price;
  return {
    item_id: params.id,
    item_name: params.name,
    price: numericPrice,
    item_variant: params.variant,
    item_category: params.category || "Apparel",
    quantity: params.quantity || 1,
    currency: params.currency || "PKR",
  };
}

/**
 * Master event dispatcher for all analytics providers with consent gating.
 */
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  // Build a deduplication signature
  let signature: string = event.event;
  if (event.event === "page_viewed") {
    signature = `page_viewed:${event.page_path}`;
  } else if (event.event === "product_viewed") {
    signature = `product_viewed:${event.product_id}`;
  } else if (event.event === "collection_viewed") {
    signature = `collection_viewed:${event.handle}`;
  } else if (event.event === "search_submitted") {
    signature = `search_submitted:${event.search_term}`;
  } else if (event.event === "cart_viewed") {
    signature = `cart_viewed:${event.value}:${event.items.length}`;
  }

  if (!shouldEmitEvent(signature)) {
    return;
  }

  // Get current consent preferences
  const consent = getConsentPreferences();

  // Attribution is captured conditionally based on consent
  captureAttribution();

  // Essential / Shopify storefront shims
  emitShopifyAnalytics(event);

  // Analytics Gating (GA4 / GTM)
  if (consent.decided && consent.analytics) {
    emitGA4(event);
  }

  // Marketing Gating (Meta Pixel & TikTok Pixel)
  if (consent.decided && consent.marketing) {
    emitMeta(event);
    emitTikTok(event);
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[Analytics Track: ${event.event}]`, { event, consent });
  }
}
