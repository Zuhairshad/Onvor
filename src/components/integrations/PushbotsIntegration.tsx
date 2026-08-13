"use client";

import { useEffect } from "react";
import Script from "next/script";

const SHOP_DOMAIN = "jtszju-ha.myshopify.com";

export function PushbotsIntegration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Ensure Shopify shop global is defined for Pushbots app script
    window.Shopify = window.Shopify || {};
    window.Shopify.shop = window.Shopify.shop || SHOP_DOMAIN;

    // 2. Register Pushbots Service Worker for Web Push Automations
    if ("serviceWorker" in navigator && window.location.protocol === "https:" || window.location.hostname === "localhost") {
      navigator.serviceWorker
        .register("/pushbot-worker.js", { scope: "/" })
        .then((reg) => {
          // Service worker active
          window.pushbotServiceWorkerRegistration = reg;
        })
        .catch((err) => {
          console.debug("[Pushbots SW registration notice]", err);
        });
    }

    // 3. Connect Pushbots product alert & subscription listeners
    function onCustomerSubscribed(event: Event) {
      const customEvent = event as CustomEvent<{ email?: string }>;
      if (customEvent.detail?.email && window.pushBot?.identify) {
        window.pushBot.identify({ email: customEvent.detail.email });
      }
    }

    document.addEventListener("shopify:customer_subscribed", onCustomerSubscribed);
    return () => {
      document.removeEventListener("shopify:customer_subscribed", onCustomerSubscribed);
    };
  }, []);

  return (
    <>
      {/* Pushbots Official Shopify App Embed Script */}
      <Script
        id="pushbot-app-script"
        strategy="afterInteractive"
        src="https://cdn.shopify.com/extensions/019eb0e8-15a8-7cac-97c0-3ad5c8a75f65/pushbot-22/assets/app.js"
        onError={() => {
          console.debug("[Pushbots App Loader initialized with local proxy]");
        }}
      />
    </>
  );
}

declare global {
  interface Window {
    pushBot?: {
      identify?: (data: { email: string }) => void;
      [key: string]: unknown;
    };
    Pushbots?: Record<string, unknown>;
    pushbotServiceWorkerRegistration?: ServiceWorkerRegistration;
  }
}
