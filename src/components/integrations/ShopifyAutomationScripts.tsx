"use client";

import { useEffect } from "react";
import Script from "next/script";

const SHOP_DOMAIN = "jtszju-ha.myshopify.com";
const STOREFRONT_DOMAIN = "theonvor.com";
const SHOP_ID = 99646538009;

// Global helper for publishing analytics & tracking events to Shopify Flow & App Integrations
export function trackStorefrontEvent(eventName: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  try {
    // 1. Shopify Web Pixels Manager
    if (window.Shopify?.analytics?.publish) {
      window.Shopify.analytics.publish(eventName, payload, { timestamp: Date.now() });
    }

    // 2. Trekkie / ShopifyAnalytics
    if (window.ShopifyAnalytics?.lib?.track) {
      window.ShopifyAnalytics.lib.track(eventName, payload);
    } else if (window.__TREKKIE_SHIM_QUEUE) {
      window.__TREKKIE_SHIM_QUEUE.push({
        from: "headless-app",
        method: "track",
        args: [eventName, payload],
      });
    }

    // 3. Custom Event on document for local listeners (Pushbots / Forms / Flow hooks)
    const customEvent = new CustomEvent(`shopify:${eventName}`, { detail: payload });
    document.dispatchEvent(customEvent);
  } catch (err) {
    console.debug("[Shopify Analytics Track Error]", err);
  }
}

export function ShopifyAutomationScripts() {
  useEffect(() => {
    // 1. Initialize Shopify Global Namespace
    window.Shopify = window.Shopify || {};
    window.Shopify.shop = SHOP_DOMAIN;
    window.Shopify.currency = { active: "PKR", rate: "1.0" };
    window.Shopify.country = "PK";
    window.Shopify.locale = "en";
    window.Shopify.theme = {
      id: 190590779673,
      name: "headless-onvor",
      role: "main",
    };
    window.Shopify.PaymentButton = window.Shopify.PaymentButton || {
      isStorefrontPortableWallets: true,
      init: () => {},
    };

    // 2. Initialize Trekkie / ShopifyAnalytics shim
    window.ShopifyAnalytics = window.ShopifyAnalytics || {};
    window.ShopifyAnalytics.meta = window.ShopifyAnalytics.meta || {};
    window.ShopifyAnalytics.meta.currency = "PKR";
    window.__TREKKIE_SHIM_QUEUE = window.__TREKKIE_SHIM_QUEUE || [];

    const trekkie = (window.ShopifyAnalytics.lib = window.trekkie = window.trekkie || []);
    window.ShopifyAnalytics.lib.trekkie = window.trekkie;

    if (!trekkie.methods) {
      trekkie.methods = ["identify", "page", "ready", "track", "trackForm", "trackLink"];
      trekkie.factory = function (method: string) {
        return function (...args: unknown[]) {
          trekkie.push([method, ...args]);
          if (window.__TREKKIE_SHIM_QUEUE && (method === "track" || method === "page")) {
            try {
              window.__TREKKIE_SHIM_QUEUE.push({
                from: "trekkie-stub",
                method,
                args,
              });
            } catch {
              // no-op
            }
          }
        };
      };
      for (let i = 0; i < trekkie.methods.length; i++) {
        const key = trekkie.methods[i];
        trekkie[key] = trekkie.factory(key);
      }
    }

    // 3. Initialize Web Pixels Manager
    window.Shopify.analytics = window.Shopify.analytics || {};
    const analytics = window.Shopify.analytics;
    const replayQueue = (analytics.replayQueue = analytics.replayQueue || []);
    if (!analytics.publish) {
      analytics.publish = function (e: string, r: unknown, o: unknown) {
        replayQueue.push([e, r, o]);
        return true;
      };
    }

    // 4. Monorail Abandonment Event Handler for Shopify Flow cart abandonment automations
    function handleAbandonment() {
      if (!("sendBeacon" in navigator)) return;
      try {
        const sessionTokenMatches = document.cookie.match(/_shopify_s=([^;]*)/);
        const sessionToken = sessionTokenMatches && sessionTokenMatches.length === 2 ? sessionTokenMatches[1] : "";
        const currentMs = Date.now();
        const navStart = performance?.timing?.navigationStart || currentMs;
        const payload = {
          shop_id: SHOP_ID,
          url: window.location.href,
          navigation_start: navStart,
          duration: currentMs - navStart,
          session_token: sessionToken,
          page_type: window.ShopifyAnalytics?.meta?.page?.pageType || "page",
        };

        window.navigator.sendBeacon(
          "https://monorail-edge.shopifysvc.com/v1/produce",
          JSON.stringify({
            schema_id: "online_store_buyer_site_abandonment/1.1",
            payload,
            metadata: {
              event_created_at_ms: currentMs,
              event_sent_at_ms: currentMs,
            },
          })
        );
      } catch {
        // no-op
      }
    }

    window.addEventListener("pagehide", handleAbandonment);
    return () => {
      window.removeEventListener("pagehide", handleAbandonment);
    };
  }, []);

  return (
    <>
      {/* Shopify Features JSON */}
      <script
        id="shopify-features"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            accessToken: "afe81e44d2fb6bbed49232ba704bf5b2",
            betas: ["rich-media-storefront-analytics"],
            domain: STOREFRONT_DOMAIN,
            predictiveSearch: true,
            shopId: SHOP_ID,
            locale: "en",
          }),
        }}
      />

      {/* Web Pixels Manager Loader */}
      <Script
        id="shopify-wpm"
        strategy="afterInteractive"
        src="https://extensions.shopifycdn.com/cdn/shopifycloud/web-pixels-manager/0.0.334/bundle.js"
        onError={() => {
          console.debug("[Shopify WPM script optional fallback]");
        }}
      />
    </>
  );
}

declare global {
  interface Window {
    Shopify: {
      shop?: string;
      currency?: { active: string; rate: string };
      country?: string;
      locale?: string;
      theme?: { id: number; name: string; role: string };
      PaymentButton?: { isStorefrontPortableWallets?: boolean; init: () => void };
      analytics?: {
        publish?: (eventName: string, payload: unknown, options?: unknown) => boolean;
        replayQueue?: unknown[];
        visitor?: unknown;
        initialized?: boolean;
      };
      [key: string]: unknown;
    };
    ShopifyAnalytics: {
      meta?: {
        page?: { pageType?: string; path?: string; url?: string };
        currency?: string;
        [key: string]: unknown;
      };
      lib?: {
        trekkie?: unknown[];
        track?: (eventName: string, payload?: unknown) => void;
        page?: (pageType: string, options?: unknown) => void;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    trekkie: unknown[] & {
      methods?: string[];
      factory?: (method: string) => (...args: unknown[]) => void;
      [key: string]: unknown;
    };
    __TREKKIE_SHIM_QUEUE: unknown[];
  }
}
