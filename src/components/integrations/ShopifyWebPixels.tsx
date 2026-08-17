"use client";

import { useEffect } from "react";

// Loads Shopify's Web Pixels Manager on the headless store.
// The WPM runs the shopify-app-pixel (Shopify's built-in analytics) in a
// sandboxed iframe. When page_viewed is published, the pixel sends to Monorail
// through Shopify's own infrastructure — correctly recording sessions in
// Shopify Analytics. This is the only supported headless session tracking path.

const SHOP_ID = 99646538009;
const STOREFRONT_BASE_URL = "https://checkout.theonvor.com";
const EXTENSIONS_BASE_URL = "https://extensions.shopifycdn.com/cdn/shopifycloud/web-pixels-manager";
const MONORAIL_ENDPOINT = "https://checkout.theonvor.com/.well-known/shopify/monorail/unstable/produce_batch";
const WPM_BASE_URL = "https://checkout.theonvor.com/cdn";

function loadScript(src: string, onLoad: () => void, onError: () => void) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) { onLoad(); return; }
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.addEventListener("load", onLoad);
  s.addEventListener("error", onError);
  document.head.appendChild(s);
}

export function ShopifyWebPixels() {
  useEffect(() => {
    // Set up the analytics.publish replay queue immediately so early publish()
    // calls are preserved and replayed once WPM initialises.
    window.Shopify = window.Shopify || {};
    const shopify = window.Shopify as Record<string, unknown>;
    if (!(shopify["analytics"] as Record<string, unknown> | undefined)?.["replayQueue"]) {
      const replayQueue: Array<[string, unknown, unknown]> = [];
      shopify["analytics"] = {
        replayQueue,
        publish: (e: string, r: unknown, o: unknown) => { replayQueue.push([e, r, o]); return true; },
      };
    }

    // Fetch WPM config (hash + pixel list) from our server-side cache route
    fetch("/api/shopify-wpm-config")
      .then((r) => r.json())
      .then((cfg) => {
        if (!cfg.bundleUrl) return;

        // Wire up window.webPixelsManager config before bundle loads
        (window as unknown as Record<string, unknown>)["wpmDataLayer"] = {
          shopId: SHOP_ID,
          storefrontBaseUrl: STOREFRONT_BASE_URL,
          extensionsBaseUrl: EXTENSIONS_BASE_URL,
          monorailEndpoint: MONORAIL_ENDPOINT,
          surface: "storefront-renderer",
          enabledBetaFlags: cfg.enabledBetaFlags ?? [],
          webPixelsConfigList: cfg.webPixelsConfigList ?? [],
          isMerchantRequest: false,
          initData: cfg.initData ?? {},
        };

        loadScript(
          cfg.bundleUrl,
          () => {
            // WPM bundle loaded — initialise with our config
            const wpm = (window as unknown as Record<string, unknown>)["webPixelsManager"] as
              | { init: (c: unknown) => { publishCustomEvent: (e: string, r: unknown, o: unknown) => void; visitor: unknown; } | null }
              | undefined;

            if (!wpm?.init) return;

            const instance = wpm.init({
              shopId: SHOP_ID,
              storefrontBaseUrl: STOREFRONT_BASE_URL,
              extensionsBaseUrl: EXTENSIONS_BASE_URL,
              monorailEndpoint: MONORAIL_ENDPOINT,
              surface: "storefront-renderer",
              enabledBetaFlags: cfg.enabledBetaFlags ?? [],
              webPixelsConfigList: cfg.webPixelsConfigList ?? [],
              isMerchantRequest: false,
              initData: cfg.initData ?? {},
            });

            if (!instance) return;

            // Drain the replay queue then hand off publish to the live WPM instance
            const analytics = (window.Shopify as Record<string, unknown>)["analytics"] as Record<string, unknown>;
            const queue = analytics["replayQueue"] as Array<[string, unknown, unknown]>;
            queue?.forEach(([e, r, o]) => instance.publishCustomEvent(e, r, o));
            analytics["replayQueue"] = [];
            analytics["publish"] = instance.publishCustomEvent;
            analytics["visitor"] = instance.visitor;
            analytics["initialized"] = true;
          },
          () => console.debug("[ShopifyWebPixels] WPM bundle failed to load")
        );
      })
      .catch(() => {});
  }, []);

  return null;
}
