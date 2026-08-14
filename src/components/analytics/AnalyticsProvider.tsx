"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Script from "next/script";
import { captureAttribution, trackEvent } from "@/lib/analytics";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-JD6C3GXY26";
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || "AW-18302441675";
const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID || "GT-WBLSRCZV";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1261670659444600";
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Capture incoming marketing attribution (UTMs, gclid, fbclid, ttclid)
    captureAttribution();

    // 2. Classify page type
    let pageType: "home" | "product" | "collection" | "cart" | "search" | "page" | "policy" = "page";
    if (pathname === "/") pageType = "home";
    else if (pathname.startsWith("/products/")) pageType = "product";
    else if (pathname.startsWith("/collections/")) pageType = "collection";
    else if (pathname.startsWith("/cart")) pageType = "cart";
    else if (pathname.startsWith("/search")) pageType = "search";
    else if (pathname.startsWith("/policies/")) pageType = "policy";

    // 3. Track page_viewed across all providers
    const fullUrl = window.location.href;
    const title = document.title || "ONVOR";

    trackEvent({
      event: "page_viewed",
      page_title: title,
      page_location: fullUrl,
      page_path: pathname,
      page_type: pageType,
    });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  useEffect(() => {
    // Capture attribution immediately on mount
    captureAttribution();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

      {/* Google Analytics 4 / Google Tag */}
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
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA4_ID}', { send_page_view: false });
                ${GADS_ID ? `gtag('config', '${GADS_ID}', { send_page_view: false });` : ""}
                ${GTAG_ID && GTAG_ID !== GA4_ID ? `gtag('config', '${GTAG_ID}', { send_page_view: false });` : ""}
              `,
            }}
          />
        </>
      )}

      {/* Meta Pixel (Facebook Pixel) */}
      {META_PIXEL_ID && (
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
            `,
          }}
        />
      )}

      {/* TikTok Pixel */}
      {TIKTOK_PIXEL_ID && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var c=document.createElement("script");c.type="text/javascript",c.async=!0,c.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(c,a)};
                ttq.load('${TIKTOK_PIXEL_ID}');
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
