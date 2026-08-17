"use client";

import Script from "next/script";
import { useEffect } from "react";

// Shopify Web Pixels Manager — headless session tracking.
// Loads Shopify's pixel sandbox and wires up analytics.publish() so page views
// flow through Shopify's built-in analytics and appear in the Shopify dashboard.
// This is the same mechanism Shopify Hydrogen uses on Oxygen.

const SHOP_ID = "99646538009";
const SHOP_DOMAIN = "jtszju-ha.myshopify.com";

export function ShopifyWebPixels() {
  useEffect(() => {
    // Set up the analytics publish shim before the manager script loads.
    // Early publish() calls are queued here; the manager drains the queue on load.
    window.Shopify = window.Shopify || {};
    if (!window.Shopify.analytics) {
      const queue: Array<{ type: string; payload: Record<string, unknown> }> = [];
      (window.Shopify as Record<string, unknown>)["analytics"] = {
        publish: (type: string, payload: Record<string, unknown>) => {
          queue.push({ type, payload });
        },
        _queue: queue,
      };
    }

    // Web Pixels Manager configuration — must be set before the script loads.
    (window as unknown as Record<string, unknown>)["__webPixelsManagerConfig"] = {
      shopId: SHOP_ID,
      storefrontBaseUrl: `https://${SHOP_DOMAIN}`,
      webPixelExtensionBaseUrl: "https://cdn.shopify.com",
      pixelSandboxBaseUrl: "https://pixel-sandbox.shopifycs.com",
      environment: "production",
    };
  }, []);

  return (
    <Script
      src="https://cdn.shopify.com/shopifycloud/web-pixels-manager/web-pixels-manager-init.js"
      strategy="afterInteractive"
    />
  );
}
