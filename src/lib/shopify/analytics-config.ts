// Central config for hydrogen-react analytics calls.
// Because we skip ShopifyProvider (version mismatch: hydrogen-react@2026.4.3
// targets 2026-04, our Storefront API is pinned to 2026-07), every call to
// useShopifyCookies / sendShopifyAnalytics / getClientBrowserParameters must
// pass checkoutDomain and storefrontAccessToken explicitly. Define them once
// here and import everywhere else.

export const SHOPIFY_CHECKOUT_DOMAIN = "checkout.theonvor.com";
export const SHOPIFY_STOREFRONT_ROOT_DOMAIN = "theonvor.com";

// Public (browser-safe) Storefront API access token.
// Shopify Admin → Sales channels → Headless → Storefront API → public token.
// Safe to expose to browsers; never grants write access.
export const SHOPIFY_PUBLIC_STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_TOKEN ?? "";

// Headless channel storefront ID — becomes hydrogenSubchannelId in trekkie events.
// Shopify Admin → Sales channels → Headless → [storefront] → Manage API access → Storefront ID.
const _storefrontId = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID ?? "";
export const SHOPIFY_STOREFRONT_ID = _storefrontId;

// False when NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID is absent or still "0".
// Disables Shopify Analytics (Monorail, WPM, Live View) without affecting GA4/Meta/TikTok.
export const SHOPIFY_ANALYTICS_ENABLED = !!_storefrontId && _storefrontId !== "0";

if (typeof window !== "undefined" && !SHOPIFY_ANALYTICS_ENABLED) {
  console.error(
    "[Shopify Analytics] NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID is missing or \"0\". " +
    "Shopify Analytics (Monorail / WPM / Live View) is disabled. " +
    "GA4 / Meta / TikTok remain active. " +
    "Fix: Shopify Admin → Sales channels → Headless → [storefront] → Manage API access."
  );
}

// parseGid() in hydrogen-react expects a GID string, not a bare number.
export const SHOPIFY_SHOP_GID = "gid://shopify/Shop/99646538009";
export const SHOPIFY_CURRENCY = "PKR" as const;
