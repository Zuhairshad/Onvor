"use client";

import { useEffect } from "react";

// Shopify Web Pixels Manager for headless session tracking.
// Config extracted from the Shopify Liquid store HTML.
// The shopify-app-pixel inside WPM is Shopify's built-in analytics
// pixel — when page_viewed is published it records a session in
// Shopify Analytics via Shopify's own sandboxed infrastructure.
//
// hashVersion changes when Shopify updates WPM (~monthly).
// Update BUNDLE_URL when that happens by checking:
// checkout.theonvor.com → view source → search "wpm/b" → copy hash.

const BUNDLE_URL =
  "https://checkout.theonvor.com/cdn/wpm/b979a3e2fw137e9400p4daec9d4mf64d2306m.js";

const WPM_CONFIG = {
  shopId: 99646538009,
  storefrontBaseUrl: "https://checkout.theonvor.com",
  extensionsBaseUrl:
    "https://extensions.shopifycdn.com/cdn/shopifycloud/web-pixels-manager",
  monorailEndpoint:
    "https://checkout.theonvor.com/.well-known/shopify/monorail/unstable/produce_batch",
  surface: "storefront-renderer",
  isMerchantRequest: false,
  enabledBetaFlags: ["d5bdd5d0", "656605ce"],
  webPixelsConfigList: [
    {
      id: "3071443225",
      configuration: '{"pixel_id":"1261670659444600","pixel_type":"facebook_pixel"}',
      eventPayloadVersion: "v1",
      runtimeContext: "OPEN",
      scriptVersion: "abff2a8add143ccb04deb20f0ebd74a9",
      type: "APP",
      apiClientId: 2329312,
      privacyPurposes: ["ANALYTICS", "MARKETING", "SALE_OF_DATA"],
    },
    {
      id: "2948202777",
      configuration: '{"accountID":"786"}',
      eventPayloadVersion: "v1",
      runtimeContext: "STRICT",
      scriptVersion: "855ef7b99d818cb428c1ee25e2d96a95",
      type: "APP",
      apiClientId: 34264940545,
      privacyPurposes: ["ANALYTICS", "MARKETING", "SALE_OF_DATA"],
    },
    {
      id: "2943713561",
      configuration:
        '{"config":"{\\"google_tag_ids\\":[\\"G-JD6C3GXY26\\",\\"AW-18302441675\\",\\"GT-WBLSRCZV\\"]}"}',
      eventPayloadVersion: "v1",
      runtimeContext: "OPEN",
      scriptVersion: "cbf49bd7815008e05e438bca15440d34",
      type: "APP",
      apiClientId: 1780363,
      privacyPurposes: [],
    },
    {
      id: "2837414169",
      configuration: '{"webPixelName":"Judge.me"}',
      eventPayloadVersion: "v1",
      runtimeContext: "STRICT",
      scriptVersion: "34ad157958823915625854214640f0bf",
      type: "APP",
      apiClientId: 683015,
      privacyPurposes: ["ANALYTICS"],
    },
    {
      id: "shopify-app-pixel",
      configuration: "{}",
      eventPayloadVersion: "v1",
      runtimeContext: "STRICT",
      scriptVersion: "0510",
      apiClientId: "shopify-pixel",
      type: "APP",
      privacyPurposes: ["ANALYTICS", "MARKETING"],
    },
    {
      id: "shopify-custom-pixel",
      eventPayloadVersion: "v1",
      runtimeContext: "LAX",
      scriptVersion: "0510",
      apiClientId: "shopify-pixel",
      type: "CUSTOM",
      privacyPurposes: ["ANALYTICS", "MARKETING"],
    },
  ],
  initData: {
    shop: {
      name: "ONVOR",
      paymentSettings: { currencyCode: "PKR" },
      myshopifyDomain: "jtszju-ha.myshopify.com",
      countryCode: "PK",
      storefrontUrl: "https://checkout.theonvor.com",
    },
    customer: null,
    cart: null,
    checkout: null,
    productVariants: [],
    products: [],
    purchasingCompany: null,
  },
};

function loadScript(src: string, onLoad: () => void, onError: () => void) {
  if (document.querySelector(`script[src="${src}"]`)) { onLoad(); return; }
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.addEventListener("load", onLoad);
  s.addEventListener("error", onError);
  document.head.appendChild(s);
}

export function ShopifyWebPixels() {
  useEffect(() => {
    window.Shopify = window.Shopify || {};
    const shopify = window.Shopify as Record<string, unknown>;

    // WPM reads shop identity from window.Shopify for its internal telemetry.
    // Without these, it sends shop_id: -1 and Shopify can't attribute sessions.
    shopify["shopId"] = WPM_CONFIG.shopId;
    shopify["shop"] = WPM_CONFIG.initData.shop.myshopifyDomain;

    if (!(shopify["analytics"] as Record<string, unknown> | undefined)?.["replayQueue"]) {
      const replayQueue: Array<[string, unknown, unknown]> = [];
      shopify["analytics"] = {
        replayQueue,
        publish: (e: string, r: unknown, o: unknown) => { replayQueue.push([e, r, o]); return true; },
      };
    }

    loadScript(
      BUNDLE_URL,
      () => {
        const wpm = (window as unknown as Record<string, unknown>)["webPixelsManager"] as
          | { init: (c: unknown) => { publishCustomEvent: (e: string, r: unknown, o: unknown) => void; visitor: unknown } | null }
          | undefined;

        if (!wpm?.init) return;

        const instance = wpm.init(WPM_CONFIG);
        if (!instance) return;

        const analytics = shopify["analytics"] as Record<string, unknown>;
        const queue = analytics["replayQueue"] as Array<[string, unknown, unknown]>;
        queue?.forEach(([e, r, o]) => instance.publishCustomEvent(e, r, o));
        analytics["replayQueue"] = [];
        analytics["publish"] = instance.publishCustomEvent;
        analytics["visitor"] = instance.visitor;
        analytics["initialized"] = true;
      },
      () => console.debug("[ShopifyWebPixels] WPM bundle failed to load")
    );
  }, []);

  return null;
}
