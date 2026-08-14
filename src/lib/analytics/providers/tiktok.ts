import type { AnalyticsEvent } from "../types";

declare global {
  interface Window {
    ttq?: {
      track: (eventName: string, params?: Record<string, unknown>) => void;
      page: () => void;
      load?: (pixelId: string) => void;
      [key: string]: unknown;
    };
  }
}

export function emitTikTok(event: AnalyticsEvent) {
  if (typeof window === "undefined" || !window.ttq?.track) return;

  try {
    switch (event.event) {
      case "page_viewed": {
        if (window.ttq.page) window.ttq.page();
        else window.ttq.track("Pageview");
        break;
      }

      case "product_viewed": {
        window.ttq.track("ViewContent", {
          content_id: event.product_id,
          content_type: "product",
          content_name: event.title,
          content_category: event.product_type || "Apparel",
          price: event.value,
          value: event.value,
          currency: event.currency,
        });
        break;
      }

      case "search_submitted": {
        window.ttq.track("Search", {
          query: event.search_term,
        });
        break;
      }

      case "product_added_to_cart": {
        const item = event.items[0];
        window.ttq.track("AddToCart", {
          content_id: item?.item_id || "product",
          content_type: "product",
          content_name: item?.item_name || "Product",
          quantity: item?.quantity || 1,
          price: event.value,
          value: event.value,
          currency: event.currency,
        });
        break;
      }

      case "checkout_started": {
        window.ttq.track("InitiateCheckout", {
          contents: event.items.map((i) => ({
            content_id: i.item_id,
            content_name: i.item_name,
            quantity: i.quantity || 1,
            price: i.price,
          })),
          value: event.value,
          currency: event.currency,
        });
        break;
      }

      case "customer_subscribed": {
        window.ttq.track("Subscribe", {
          value: 0,
          currency: "PKR",
        });
        break;
      }

      case "contact_submitted": {
        window.ttq.track("Contact");
        break;
      }
    }
  } catch (err) {
    console.debug("[TikTok Pixel Dispatch Notice]", err);
  }
}
