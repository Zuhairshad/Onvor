"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useSyncExternalStore } from "react";
import Script from "next/script";
import { captureAttribution, getConsentPreferences, subscribeConsent, trackEvent, type ConsentPreferences } from "@/lib/analytics";
import { sendShopifyPageView } from "@/lib/analytics/shopify-monorail";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-JD6C3GXY26";
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || "AW-18302441675";
const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID || "GT-WBLSRCZV";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1261670659444600";
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

// localStorage key must match consent.ts
const CONSENT_KEY = "onvor_consent_preferences";

const SERVER_CONSENT_SNAPSHOT: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  decided: false,
  timestamp: 0,
};

function getServerConsentSnapshot(): ConsentPreferences {
  return SERVER_CONSENT_SNAPSHOT;
}

function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttribution();

    let pageType: "home" | "product" | "collection" | "cart" | "search" | "page" | "policy" = "page";
    if (pathname === "/") pageType = "home";
    else if (pathname.startsWith("/products/")) pageType = "product";
    else if (pathname.startsWith("/collections/")) pageType = "collection";
    else if (pathname.startsWith("/cart")) pageType = "cart";
    else if (pathname.startsWith("/search")) pageType = "search";
    else if (pathname.startsWith("/policies/")) pageType = "policy";

    const fullUrl = window.location.href;
    const title = document.title || "ONVOR";

    trackEvent({
      event: "page_viewed",
      page_title: title,
      page_location: fullUrl,
      page_path: pathname,
      page_type: pageType,
    });

    const heartbeat = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      sendShopifyPageView({
        url: window.location.href,
        referrer: document.referrer || "",
        pageType,
        resourceId: null,
        customerId: null,
      });
    }, 2 * 60 * 1000);

    return () => clearInterval(heartbeat);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  const consent = useSyncExternalStore(subscribeConsent, getConsentPreferences, getServerConsentSnapshot);

  useEffect(() => {
    captureAttribution();
  }, [consent]);

  // Propagate consent changes to GA4 after it has loaded.
  // The initial consent default is handled inside the google-gtag-init inline
  // script by reading localStorage synchronously — that avoids the useEffect
  // timing problem where the server snapshot (decided:false) would fire first
  // and push consent=denied into dataLayer before GA4 even loads.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });
  }, [consent.analytics, consent.marketing]);

  const canLoadMeta = consent.decided && consent.marketing;
  const canLoadTikTok = consent.decided && consent.marketing && Boolean(TIKTOK_PIXEL_ID);

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

      {/* Google Analytics 4 — always loaded so GA4 initialises cleanly on every
          page load. Consent mode (set inline below) controls whether full hits or
          cookieless pings are sent; the React useEffect above propagates updates. */}
      {GA4_ID && (
        <>
          <Script
            id="google-gtag"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script
            id="google-gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                window.gtag = gtag;
                var _c = {};
                try { _c = JSON.parse(localStorage.getItem('${CONSENT_KEY}') || '{}'); } catch(e) {}
                var _analytics = !!(_c.decided && _c.analytics);
                var _marketing = !!(_c.decided && _c.marketing);
                gtag('consent', 'default', {
                  analytics_storage: _analytics ? 'granted' : 'denied',
                  ad_storage: _marketing ? 'granted' : 'denied',
                  ad_user_data: _marketing ? 'granted' : 'denied',
                  ad_personalization: _marketing ? 'granted' : 'denied'
                });
                gtag('js', new Date());
                gtag('config', '${GA4_ID}');
                ${GADS_ID ? `if (_marketing) gtag('config', '${GADS_ID}', { send_page_view: false });` : ""}
                ${GTAG_ID && GTAG_ID !== GA4_ID ? `gtag('config', '${GTAG_ID}', { send_page_view: false });` : ""}
              `,
            }}
          />
        </>
      )}

      {/* Meta Pixel (Only loaded after Marketing consent) */}
      {canLoadMeta && META_PIXEL_ID && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('consent', 'grant');
            `,
          }}
        />
      )}

      {/* TikTok Pixel (Only loaded after Marketing consent) */}
      {canLoadTikTok && TIKTOK_PIXEL_ID && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var c=document.createElement("script");c.type="text/javascript",c.async=!0,c.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(c,a)};
                ttq.load('${TIKTOK_PIXEL_ID}');
                ttq.grantConsent();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
