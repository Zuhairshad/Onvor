const SHOP_DOMAIN = "jtszju-ha.myshopify.com";
const SHOP_ID = 99646538009;

const VISITOR_COOKIE = "_shopify_y";
const SESSION_COOKIE = "_shopify_s";
const SESSION_MAX_AGE = 30 * 60; // 30 minutes in seconds
const VISITOR_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

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
  // Always refresh session TTL on activity
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

  // Never send analytics from local dev — would pollute Shopify's session data with localhost URLs
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

    const endpoint = `https://${SHOP_DOMAIN}/cdn/shop/monorail/unstable/produce_batch`;

    // sendBeacon must use Blob to set Content-Type: application/json.
    // Passing a plain string sends text/plain which Shopify's endpoint rejects silently.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(endpoint, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // non-critical
  }
}
