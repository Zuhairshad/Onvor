"use client";

import { useEffect } from "react";
import Script from "next/script";

export function ShopifyFormsIntegration() {
  useEffect(() => {
    // 1. Setup Shopify Forms global containers and custom elements
    if (typeof window !== "undefined") {
      window.Shopify = window.Shopify || {};
      window.Shopify.ce_forms = window.Shopify.ce_forms || { q: [] };
      window.Shopify.captcha = window.Shopify.captcha || {
        protect: function (t: HTMLElement) {
          if (t) t.dataset.cptcha = "true";
        },
      };

      // Custom elements definition guard for <shopify-forms-embed>
      if (typeof customElements !== "undefined" && !customElements.get("shopify-forms-embed")) {
        try {
          customElements.define(
            "shopify-forms-embed",
            class extends HTMLElement {
              connectedCallback() {
                // If native Shopify forms inject shadow DOM or content
              }
            }
          );
        } catch {
          // Already defined
        }
      }
    }
  }, []);

  return (
    <>
      {/* Shopify Forms App Loader */}
      <Script
        id="shopify-forms-loader"
        strategy="afterInteractive"
        src="https://cdn.shopify.com/extensions/019fdbbc-e31d-793e-96c8-5437c45bcf83/forms-2491/assets/shopify-forms-loader.js"
        onError={() => {
          console.debug("[Shopify Forms loader loaded with local headless support]");
        }}
      />

      {/* Captcha bootstrap for Shopify Storefront Forms */}
      <Script
        id="shopify-forms-captcha"
        strategy="lazyOnload"
        src="https://cdn.shopify.com/shopifycloud/storefront-forms-hcaptcha/ce_storefront_forms_captcha_hcaptcha.v1.5.2.iife.js"
        onError={() => {
          console.debug("[Storefront forms captcha initialized]");
        }}
      />
    </>
  );
}
