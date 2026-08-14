import type { AnalyticsEvent } from "../types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function emitGA4(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  try {
    switch (event.event) {
      case "page_viewed": {
        if (window.gtag) {
          window.gtag("event", "page_view", {
            page_title: event.page_title,
            page_location: event.page_location,
            page_path: event.page_path,
          });
        }
        window.dataLayer.push({
          event: "page_view",
          page_title: event.page_title,
          page_location: event.page_location,
          page_path: event.page_path,
          page_type: event.page_type,
        });
        break;
      }

      case "product_viewed": {
        const payload = {
          currency: event.currency,
          value: event.value,
          items: event.items,
        };
        if (window.gtag) {
          window.gtag("event", "view_item", payload);
        }
        window.dataLayer.push({
          event: "view_item",
          ecommerce: payload,
        });
        break;
      }

      case "collection_viewed": {
        const payload = {
          item_list_id: event.handle,
          item_list_name: event.title,
          items: event.items,
        };
        if (window.gtag) {
          window.gtag("event", "view_item_list", payload);
        }
        window.dataLayer.push({
          event: "view_item_list",
          ecommerce: payload,
        });
        break;
      }

      case "search_submitted": {
        const payload = {
          search_term: event.search_term,
        };
        if (window.gtag) {
          window.gtag("event", "search", payload);
        }
        window.dataLayer.push({
          event: "search",
          ...payload,
        });
        break;
      }

      case "product_added_to_cart": {
        const payload = {
          currency: event.currency,
          value: event.value,
          items: event.items,
        };
        if (window.gtag) {
          window.gtag("event", "add_to_cart", payload);
        }
        window.dataLayer.push({
          event: "add_to_cart",
          ecommerce: payload,
        });
        break;
      }

      case "product_removed_from_cart": {
        const payload = {
          currency: event.currency,
          value: event.value,
          items: event.items,
        };
        if (window.gtag) {
          window.gtag("event", "remove_from_cart", payload);
        }
        window.dataLayer.push({
          event: "remove_from_cart",
          ecommerce: payload,
        });
        break;
      }

      case "cart_viewed": {
        const payload = {
          currency: event.currency,
          value: event.value,
          items: event.items,
        };
        if (window.gtag) {
          window.gtag("event", "view_cart", payload);
        }
        window.dataLayer.push({
          event: "view_cart",
          ecommerce: payload,
        });
        break;
      }

      case "checkout_started": {
        const payload = {
          currency: event.currency,
          value: event.value,
          items: event.items,
        };
        if (window.gtag) {
          window.gtag("event", "begin_checkout", payload);
        }
        window.dataLayer.push({
          event: "begin_checkout",
          ecommerce: payload,
        });
        break;
      }

      case "customer_subscribed": {
        if (window.gtag) {
          window.gtag("event", "generate_lead", {
            event_category: "engagement",
            event_label: event.source || "newsletter",
          });
        }
        window.dataLayer.push({
          event: "generate_lead",
          source: event.source || "newsletter",
        });
        break;
      }

      case "contact_submitted": {
        if (window.gtag) {
          window.gtag("event", "contact", {
            event_category: "engagement",
          });
        }
        window.dataLayer.push({
          event: "contact",
        });
        break;
      }
    }
  } catch (err) {
    console.debug("[GA4 Dispatch Notice]", err);
  }
}
