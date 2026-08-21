import {
  AnalyticsEventName,
  AnalyticsPageType,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from "@shopify/hydrogen-react";
import type { ShopifyPageViewPayload, ShopifyAddToCartPayload } from "@shopify/hydrogen-react";
import {
  SHOPIFY_ANALYTICS_ENABLED,
  SHOPIFY_CHECKOUT_DOMAIN,
  SHOPIFY_CURRENCY,
  SHOPIFY_SHOP_GID,
  SHOPIFY_STOREFRONT_ID,
} from "@/lib/shopify/analytics-config";
import { getConsentPreferences } from "../consent";
import type { AnalyticsEvent } from "../types";

type CustomerPrivacyApi = {
  analyticsProcessingAllowed?: () => boolean;
  marketingAllowed?: () => boolean;
  saleOfDataAllowed?: () => boolean;
};

function wpmPublish(event: string, payload: Record<string, unknown>) {
  const analytics = (window.Shopify as Record<string, unknown> | undefined)
    ?.["analytics"] as Record<string, unknown> | undefined;
  if (typeof analytics?.["publish"] === "function") {
    (analytics["publish"] as (e: string, p: Record<string, unknown>) => void)(event, payload);
  }
}

function getCustomerPrivacyApi(): CustomerPrivacyApi | undefined {
  return (window.Shopify as Record<string, unknown> | undefined)
    ?.["customerPrivacy"] as CustomerPrivacyApi | undefined;
}

export function emitShopifyAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  if (!SHOPIFY_ANALYTICS_ENABLED) return;

  try {
    // Prefer Shopify's Customer Privacy API (set by storefront-banner.js) for
    // consent gating. Fall back to our localStorage consent while the banner
    // script is still loading on the first paint.
    const cpApi = getCustomerPrivacyApi();
    const consent = getConsentPreferences();
    const hasUserConsent =
      cpApi?.analyticsProcessingAllowed?.() ?? (!consent.decided || consent.analytics);

    const browserParams = getClientBrowserParameters();

    const base = {
      ...browserParams,
      hasUserConsent,
      shopifySalesChannel: "headless" as const,
      storefrontId: SHOPIFY_STOREFRONT_ID,
      shopId: SHOPIFY_SHOP_GID,
      currency: SHOPIFY_CURRENCY,
      analyticsAllowed: cpApi?.analyticsProcessingAllowed?.(),
      marketingAllowed: cpApi?.marketingAllowed?.(),
      saleOfDataAllowed: cpApi?.saleOfDataAllowed?.(),
    };

    switch (event.event) {
      case "page_viewed": {
        const payload: ShopifyPageViewPayload = {
          ...base,
          pageType: toAnalyticsPageType(event.page_type),
        };
        sendShopifyAnalytics(
          { eventName: AnalyticsEventName.PAGE_VIEW, payload },
          SHOPIFY_CHECKOUT_DOMAIN,
        ).catch(() => {});

        // Publish through WPM so sandboxed pixels (shopify-app-pixel, Meta, etc.) receive it.
        wpmPublish("page_viewed", {});
        break;
      }

      case "product_viewed": {
        const payload: ShopifyPageViewPayload = {
          ...base,
          pageType: AnalyticsPageType.product,
          resourceId: event.product_id
            ? `gid://shopify/Product/${event.product_id}`
            : undefined,
        };
        sendShopifyAnalytics(
          { eventName: AnalyticsEventName.PAGE_VIEW, payload },
          SHOPIFY_CHECKOUT_DOMAIN,
        ).catch(() => {});
        break;
      }

      case "collection_viewed": {
        const payload: ShopifyPageViewPayload = {
          ...base,
          pageType: AnalyticsPageType.collection,
          collectionHandle: event.handle,
          collectionId: event.collection_id
            ? `gid://shopify/Collection/${event.collection_id}`
            : undefined,
        };
        sendShopifyAnalytics(
          { eventName: AnalyticsEventName.PAGE_VIEW, payload },
          SHOPIFY_CHECKOUT_DOMAIN,
        ).catch(() => {});
        break;
      }

      case "search_submitted": {
        const payload: ShopifyPageViewPayload = {
          ...base,
          pageType: AnalyticsPageType.search,
          searchString: event.search_term,
        };
        sendShopifyAnalytics(
          { eventName: AnalyticsEventName.PAGE_VIEW, payload },
          SHOPIFY_CHECKOUT_DOMAIN,
        ).catch(() => {});
        break;
      }

      case "cart_viewed": {
        const payload: ShopifyPageViewPayload = {
          ...base,
          pageType: AnalyticsPageType.cart,
        };
        sendShopifyAnalytics(
          { eventName: AnalyticsEventName.PAGE_VIEW, payload },
          SHOPIFY_CHECKOUT_DOMAIN,
        ).catch(() => {});
        wpmPublish("cart_viewed", {});
        break;
      }

      case "product_added_to_cart": {
        // cartId is required by the type but we don't carry it in our event;
        // sendShopifyAnalytics handles an empty cartId gracefully (cart_token: null).
        const payload = { ...base, cartId: "" } as ShopifyAddToCartPayload;
        sendShopifyAnalytics(
          { eventName: AnalyticsEventName.ADD_TO_CART, payload },
          SHOPIFY_CHECKOUT_DOMAIN,
        ).catch(() => {});
        wpmPublish("product_added_to_cart", {});
        break;
      }
    }

    document.dispatchEvent(new CustomEvent(`shopify:${event.event}`, { detail: event }));
  } catch (err) {
    console.debug("[Shopify Analytics]", err);
  }
}

function toAnalyticsPageType(pageType: string | undefined): string {
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
