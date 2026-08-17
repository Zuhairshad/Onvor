const SHOP_ID = 99646538009;

const VISITOR_COOKIE = "_shopify_y";
const SESSION_COOKIE = "_shopify_s";
const SESSION_MAX_AGE = 30 * 60;
const VISITOR_MAX_AGE = 365 * 24 * 60 * 60;

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function getOrCreateShopifyCookies(): { y: string; s: string } {
  let y = getCookie(VISITOR_COOKIE);
  if (!y) {
    y = generateUUID();
    setCookie(VISITOR_COOKIE, y, VISITOR_MAX_AGE);
  }

  let s = getCookie(SESSION_COOKIE);
  if (!s) {
    s = generateUUID();
  }
  setCookie(SESSION_COOKIE, s, SESSION_MAX_AGE);

  return { y, s };
}

export interface MonorailPageViewParams {
  url: string;
  referrer: string;
  pageType: string;
  resourceId?: string | null;
  customerId?: string | null;
}

export function sendShopifyPageView(params: MonorailPageViewParams): void {
  if (typeof window === "undefined") return;

  // Skip on localhost — avoids polluting Shopify's session data with dev URLs
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return;

  try {
    const cookies = getOrCreateShopifyCookies();
    const now = Date.now();

    const body = JSON.stringify({
      events: [
        {
          schema_id: "trekkie_storefront_page_view/1.4",
          payload: {
            appClientId: "storefront-renderer",
            hydrogenSubchannelId: "0",
            isMerchantRequest: false,
            monorailRegion: "shop_domain",
            pageType: params.pageType,
            resourceType: params.pageType,
            resourceId: params.resourceId ?? null,
            customerId: params.customerId ?? null,
            canonicalUrl: params.url,
            referrer: params.referrer,
            shopId: SHOP_ID,
            currency: "PKR",
            isPersistentCookieSet: true,
            shopifyCookies: {
              y: cookies.y,
              s: cookies.s,
            },
          },
          metadata: {
            event_created_at_ms: now,
            event_sent_at_ms: now,
          },
        },
      ],
    });

    // Send directly to Shopify's CDN Monorail endpoint using text/plain Content-Type.
    // text/plain avoids the CORS preflight; Shopify accepts the JSON body regardless.
    // This is the same pattern Shopify Hydrogen uses for headless storefronts.
    fetch("https://jtszju-ha.myshopify.com/cdn/shop/monorail/unstable/produce_batch", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // non-critical
  }
}
