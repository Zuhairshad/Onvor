"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { useShopifyCookies } from "@shopify/hydrogen-react";
import { getConsentPreferences, subscribeConsent } from "@/lib/analytics";
import type { ConsentPreferences } from "@/lib/analytics";
import {
  SHOPIFY_CHECKOUT_DOMAIN,
  SHOPIFY_PUBLIC_STOREFRONT_TOKEN,
  SHOPIFY_STOREFRONT_ROOT_DOMAIN,
} from "@/lib/shopify/analytics-config";

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

function loadWpmScript(src: string, config: typeof WPM_CONFIG, onLoad: () => void, onError: () => void) {
  if (document.querySelector(`script[src="${src}"]`)) { onLoad(); return; }
  const s = document.createElement("script");
  s.src = src;
  // WPM's il() reads config from document.currentScript.dataset at bundle
  // execution time. async=true makes currentScript null — set it to false so
  // the browser executes the script synchronously (inline order) and
  // currentScript points to this element. Data attributes mirror what the
  // Liquid store sets on its wpmLoader call.
  s.async = false;
  s.dataset.shopId = String(config.shopId);
  s.dataset.storefrontBaseUrl = config.storefrontBaseUrl;
  s.dataset.monorailEndpoint = config.monorailEndpoint;
  s.dataset.surface = config.surface;
  s.dataset.isMerchantRequest = String(config.isMerchantRequest);
  s.dataset.enabledBetaFlags = JSON.stringify(config.enabledBetaFlags);
  s.addEventListener("load", onLoad);
  s.addEventListener("error", onError);
  document.head.appendChild(s);
}

const SERVER_CONSENT_SNAPSHOT: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  decided: false,
  timestamp: 0,
};
function getServerConsentSnapshot() { return SERVER_CONSENT_SNAPSHOT; }

export function ShopifyWebPixels() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentPreferences,
    getServerConsentSnapshot,
  );

  // Fetch Shopify-issued tracking values via the /api/unstable/graphql.json
  // same-origin proxy, then persist them to _shopify_y / _shopify_s cookies
  // scoped to .theonvor.com so checkout.theonvor.com shares the same identity.
  useShopifyCookies({
    hasUserConsent: !consent.decided || consent.analytics,
    fetchTrackingValues: true,
    checkoutDomain: SHOPIFY_CHECKOUT_DOMAIN,
    storefrontAccessToken: SHOPIFY_PUBLIC_STOREFRONT_TOKEN,
  });

  // Propagate our consent decisions to Shopify's Customer Privacy API once
  // the user has made a choice. storefront-banner.js sets up
  // window.Shopify.customerPrivacy — this fires after that script loads.
  useEffect(() => {
    if (!consent.decided) return;
    const cpApi = (window.Shopify as Record<string, unknown> | undefined)
      ?.["customerPrivacy"] as
      | { setTrackingConsent?: (c: Record<string, unknown>, cb?: () => void) => void }
      | undefined;
    cpApi?.setTrackingConsent?.({
      analytics: consent.analytics,
      marketing: consent.marketing,
      preferences: false,
      sale_of_data: false,
      headlessStorefront: true,
      checkoutRootDomain: SHOPIFY_CHECKOUT_DOMAIN,
      storefrontRootDomain: SHOPIFY_STOREFRONT_ROOT_DOMAIN,
      storefrontAccessToken: SHOPIFY_PUBLIC_STOREFRONT_TOKEN,
    });
  }, [consent.decided, consent.analytics, consent.marketing]);

  // WPM initialisation — runs once on mount.
  useEffect(() => {
    window.Shopify = window.Shopify || {};
    const shopify = window.Shopify as Record<string, unknown>;

    // WPM reads shop identity from window.Shopify for its internal telemetry.
    shopify["shopId"] = WPM_CONFIG.shopId;
    shopify["shop"] = WPM_CONFIG.initData.shop.myshopifyDomain;

    // Consent bridge: give WPM and STRICT-mode pixels (shopify-app-pixel) a
    // customerPrivacy reference before storefront-banner.js finishes loading.
    // Without this, analyticsProcessingAllowed() is undefined and the pixel
    // defaults to blocked — no session is recorded in Live View.
    // storefront-banner.js replaces this object with the real implementation
    // once loadBanner() resolves. The bridge uses opt-out semantics: undecided
    // visitors are treated as consenting (correct for non-GDPR regions).
    if (!shopify["customerPrivacy"]) {
      const c = getConsentPreferences();
      const analyticsOk = !c.decided || c.analytics;
      const marketingOk = !c.decided || c.marketing;
      shopify["customerPrivacy"] = {
        analyticsProcessingAllowed: () => analyticsOk,
        marketingAllowed: () => marketingOk,
        saleOfDataAllowed: () => false,
        shouldShowBanner: () => !c.decided,
        currentVisitorConsent: () => ({
          analytics: analyticsOk ? "yes" : "no",
          marketing: marketingOk ? "yes" : "no",
          preferences: "no",
          sale_of_data: "no",
        }),
        setTrackingConsent: (_consent: unknown, cb?: () => void) => cb?.(),
      };
    }

    if (!(shopify["analytics"] as Record<string, unknown> | undefined)?.["replayQueue"]) {
      const replayQueue: Array<[string, unknown, unknown]> = [];
      shopify["analytics"] = {
        replayQueue,
        publish: (e: string, r: unknown, o: unknown) => { replayQueue.push([e, r, o]); return true; },
      };
    }

    loadWpmScript(
      BUNDLE_URL,
      WPM_CONFIG,
      () => {
        const wpm = (window as unknown as Record<string, unknown>)["webPixelsManager"] as
          | { init: (c: unknown) => { publish: (e: string, r: unknown, o: unknown) => void; publishCustomEvent: (e: string, r: unknown, o: unknown) => void; visitor: unknown } | null }
          | undefined;

        if (!wpm?.init) return;

        const instance = wpm.init(WPM_CONFIG);
        if (!instance) return;

        const analytics = shopify["analytics"] as Record<string, unknown>;
        const queue = analytics["replayQueue"] as Array<[string, unknown, unknown]>;
        analytics["replayQueue"] = [];
        // publish is for standard Shopify events (page_viewed, etc.) that the
        // shopify-app-pixel subscribes to. publishCustomEvent is for merchant
        // custom events and does NOT reach the shopify-app-pixel subscriber.
        analytics["publish"] = instance.publish;
        analytics["visitor"] = instance.visitor;
        analytics["initialized"] = true;

        // Drain the pre-init queue after a brief delay so pixel sandbox workers
        // have time to load and register their event subscribers before replay.
        setTimeout(() => {
          queue?.forEach(([e, r, o]) => instance.publish(e, r, o));
        }, 500);
      },
      () => console.debug("[ShopifyWebPixels] WPM bundle failed to load")
    );
  }, []);

  return (
    // Shopify Customer Privacy API — sets up window.Shopify.customerPrivacy
    // with real consent management backed by Shopify's infrastructure.
    // Headless init: after the script loads, call privacyBanner.loadBanner()
    // with the three required identifiers. data-* attributes are for Liquid
    // stores; they have no effect in headless.
    // Ref: https://shopify.dev/docs/api/customer-privacy
    <Script
      id="shopify-privacy-banner"
      src="https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js"
      strategy="afterInteractive"
      onLoad={() => {
        const banner = (window as unknown as { privacyBanner?: {
          loadBanner: (config: {
            storefrontAccessToken: string;
            checkoutRootDomain: string;
            storefrontRootDomain: string;
          }) => Promise<void>;
        } }).privacyBanner;

        if (!banner) {
          console.debug("[ShopifyWebPixels] privacyBanner not found after script load");
          return;
        }

        banner.loadBanner({
          storefrontAccessToken: SHOPIFY_PUBLIC_STOREFRONT_TOKEN,
          checkoutRootDomain: SHOPIFY_CHECKOUT_DOMAIN,
          storefrontRootDomain: SHOPIFY_STOREFRONT_ROOT_DOMAIN,
        }).then(() => {
          // loadBanner() resolves when the banner is initialised, but
          // window.Shopify.customerPrivacy may be populated asynchronously
          // after the promise resolves. Poll for it rather than calling
          // setTrackingConsent immediately and silently no-oping.
          const POLL_INTERVAL_MS = 100;
          const POLL_TIMEOUT_MS = 10_000;
          let elapsed = 0;
          const id = setInterval(() => {
            const cpApi = (window.Shopify as Record<string, unknown> | undefined)
              ?.["customerPrivacy"] as
              | { setTrackingConsent?: (consent: Record<string, unknown>, cb?: () => void) => void }
              | undefined;

            if (!cpApi?.setTrackingConsent) {
              elapsed += POLL_INTERVAL_MS;
              if (elapsed >= POLL_TIMEOUT_MS) {
                clearInterval(id);
                console.error(
                  "[ShopifyWebPixels] window.Shopify.customerPrivacy did not appear " +
                  "within 10 s of privacyBanner.loadBanner() resolving. " +
                  "Consent decisions will not reach Shopify's API on this page load.",
                );
              }
              return;
            }

            clearInterval(id);
            // Propagate any pre-existing consent decision now that the API is
            // ready. The useEffect above only fires on future changes; this
            // covers the initial state on page load.
            const c = getConsentPreferences();
            if (!c.decided) return;
            cpApi.setTrackingConsent({
              analytics: c.analytics,
              marketing: c.marketing,
              preferences: false,
              sale_of_data: false,
              headlessStorefront: true,
              checkoutRootDomain: SHOPIFY_CHECKOUT_DOMAIN,
              storefrontRootDomain: SHOPIFY_STOREFRONT_ROOT_DOMAIN,
              storefrontAccessToken: SHOPIFY_PUBLIC_STOREFRONT_TOKEN,
            });
          }, POLL_INTERVAL_MS);
        }).catch(() => {
          console.debug("[ShopifyWebPixels] privacyBanner.loadBanner() failed");
        });
      }}
    />
  );
}
