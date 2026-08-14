import type { AnalyticsEvent } from "../types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function emitMeta(event: AnalyticsEvent) {
  if (typeof window === "undefined" || !window.fbq) return;

  try {
    switch (event.event) {
      case "page_viewed": {
        window.fbq("track", "PageView");
        break;
      }

      case "product_viewed": {
        window.fbq("track", "ViewContent", {
          content_name: event.title,
          content_category: event.product_type || "Clothing",
          content_ids: event.items.map((i) => i.item_id),
          content_type: "product",
          value: event.value,
          currency: event.currency,
        });
        break;
      }

      case "collection_viewed": {
        window.fbq("trackCustom", "ViewCategory", {
          content_category: event.title,
          content_ids: event.items.slice(0, 10).map((i) => i.item_id),
        });
        break;
      }

      case "search_submitted": {
        window.fbq("track", "Search", {
          search_string: event.search_term,
        });
        break;
      }

      case "product_added_to_cart": {
        const item = event.items[0];
        window.fbq("track", "AddToCart", {
          content_name: item?.item_name || "Product",
          content_ids: event.items.map((i) => i.item_id),
          content_type: "product",
          value: event.value,
          currency: event.currency,
          num_items: event.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
        });
        break;
      }

      case "checkout_started": {
        window.fbq("track", "InitiateCheckout", {
          content_ids: event.items.map((i) => i.item_id),
          content_type: "product",
          value: event.value,
          currency: event.currency,
          num_items: event.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
        });
        break;
      }

      case "customer_subscribed": {
        window.fbq("track", "Lead", {
          content_name: "Newsletter Subscription",
        });
        break;
      }

      case "contact_submitted": {
        window.fbq("track", "Contact");
        break;
      }
    }
  } catch (err) {
    console.debug("[Meta Pixel Dispatch Notice]", err);
  }
}
