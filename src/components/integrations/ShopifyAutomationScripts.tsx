"use client";

import { useEffect } from "react";

const SHOP_DOMAIN = "jtszju-ha.myshopify.com";

export function ShopifyAutomationScripts() {
  useEffect(() => {
    // Minimal Shopify global namespace required by cart operations, checkout URL
    // building, and any installed Shopify apps that read window.Shopify.shop.
    // WPM, Trekkie, and the legacy Monorail abandonment beacon have been removed —
    // they all require a Liquid server session context unavailable in headless.
    // Session tracking is handled by shopify-monorail.ts instead.
    window.Shopify = window.Shopify || {};
    window.Shopify.shop = SHOP_DOMAIN;
    window.Shopify.currency = window.Shopify.currency || { active: "PKR", rate: "1.0" };
    window.Shopify.country = window.Shopify.country || "PK";
    window.Shopify.locale = window.Shopify.locale || "en";
  }, []);

  return null;
}

declare global {
  interface Window {
    Shopify: {
      shop?: string;
      currency?: { active: string; rate: string };
      country?: string;
      locale?: string;
      [key: string]: unknown;
    };
  }
}
