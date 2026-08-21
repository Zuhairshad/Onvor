// Adapter: maps the sendShopifyPageView signature used by AnalyticsProvider's
// 2-minute heartbeat onto hydrogen-react's sendShopifyAnalytics.
//
// Cookie management was removed: useShopifyCookies in ShopifyWebPixels now
// fetches Shopify-issued uniqueToken / visitToken via the /api/unstable/graphql.json
// proxy and persists them to _shopify_y / _shopify_s. getClientBrowserParameters()
// reads those values; no self-minted UUIDs exist anywhere in this codebase.

import {
  AnalyticsEventName,
  AnalyticsPageType,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from "@shopify/hydrogen-react";
import {
  SHOPIFY_ANALYTICS_ENABLED,
  SHOPIFY_CHECKOUT_DOMAIN,
  SHOPIFY_CURRENCY,
  SHOPIFY_SHOP_GID,
  SHOPIFY_STOREFRONT_ID,
} from "@/lib/shopify/analytics-config";
import { getConsentPreferences } from "@/lib/analytics/consent";

export interface MonorailPageViewParams {
  url: string;
  referrer: string;
  pageType: string;
  resourceId?: string | null;
  customerId?: string | null;
}

export function sendShopifyPageView(params: MonorailPageViewParams): void {
  if (typeof window === "undefined") return;
  if (!SHOPIFY_ANALYTICS_ENABLED) return;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;

  const cpApi = (window.Shopify as Record<string, unknown> | undefined)
    ?.["customerPrivacy"] as { analyticsProcessingAllowed?: () => boolean } | undefined;
  const consent = getConsentPreferences();
  const hasUserConsent =
    cpApi?.analyticsProcessingAllowed?.() ?? (!consent.decided || consent.analytics);

  const browserParams = getClientBrowserParameters();

  sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.PAGE_VIEW,
      payload: {
        ...browserParams,
        url: params.url,
        referrer: params.referrer,
        hasUserConsent,
        shopifySalesChannel: "headless",
        storefrontId: SHOPIFY_STOREFRONT_ID,
        shopId: SHOPIFY_SHOP_GID,
        currency: SHOPIFY_CURRENCY,
        pageType: toAnalyticsPageType(params.pageType),
      },
    },
    SHOPIFY_CHECKOUT_DOMAIN,
  ).catch(() => {});
}

function toAnalyticsPageType(pageType: string): string {
  switch (pageType) {
    case "home":       return AnalyticsPageType.home;
    case "product":    return AnalyticsPageType.product;
    case "collection": return AnalyticsPageType.collection;
    case "cart":       return AnalyticsPageType.cart;
    case "search":     return AnalyticsPageType.search;
    case "policy":     return AnalyticsPageType.policy;
    default:           return AnalyticsPageType.page;
  }
}
