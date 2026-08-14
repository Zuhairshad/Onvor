/**
 * Typed schemas for ecommerce events, items, and attribution.
 */

export type EcommerceItem = {
  item_id: string; // SKU or Variant ID or Product ID
  item_name: string; // Product title
  item_brand?: string;
  item_category?: string; // Product type
  item_variant?: string; // Selected options (e.g. "Size: L / Color: Black")
  price: number;
  quantity?: number;
  currency?: string;
};

export type AttributionData = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  ttclid?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  timestamp?: number;
};

export type PageViewEvent = {
  event: "page_viewed";
  page_title: string;
  page_location: string;
  page_path: string;
  page_type: "home" | "product" | "collection" | "cart" | "search" | "page" | "policy";
};

export type ProductViewedEvent = {
  event: "product_viewed";
  currency: string;
  value: number;
  items: EcommerceItem[];
  product_id: string;
  handle: string;
  title: string;
  product_type?: string;
};

export type CollectionViewedEvent = {
  event: "collection_viewed";
  collection_id?: string;
  handle: string;
  title: string;
  items: EcommerceItem[];
};

export type SearchSubmittedEvent = {
  event: "search_submitted";
  search_term: string;
  results_count: number;
};

export type ProductAddedToCartEvent = {
  event: "product_added_to_cart";
  currency: string;
  value: number;
  items: EcommerceItem[];
};

export type ProductRemovedFromCartEvent = {
  event: "product_removed_from_cart";
  currency: string;
  value: number;
  items: EcommerceItem[];
};

export type CartViewedEvent = {
  event: "cart_viewed";
  currency: string;
  value: number;
  items: EcommerceItem[];
};

export type CheckoutStartedEvent = {
  event: "checkout_started";
  currency: string;
  value: number;
  items: EcommerceItem[];
  cart_id?: string;
  checkout_url?: string;
};

export type CustomerSubscribedEvent = {
  event: "customer_subscribed";
  source?: string;
  discount_code?: string;
};

export type ContactSubmittedEvent = {
  event: "contact_submitted";
};

export type AnalyticsEvent =
  | PageViewEvent
  | ProductViewedEvent
  | CollectionViewedEvent
  | SearchSubmittedEvent
  | ProductAddedToCartEvent
  | ProductRemovedFromCartEvent
  | CartViewedEvent
  | CheckoutStartedEvent
  | CustomerSubscribedEvent
  | ContactSubmittedEvent;
