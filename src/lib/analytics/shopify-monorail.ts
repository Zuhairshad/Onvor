// Session cookies scoped to .theonvor.com so checkout.theonvor.com can read them.
// Page view events proxy through /api/shopify-analytics → server POSTs to:
//   checkout.theonvor.com/.well-known/shopify/monorail/unstable/produce_batch
// Payload matches Hydrogen's trekkie_storefront_page_view/1.4 schema exactly.

const SHOP_ID = 99646538009;
// "580111" is the online store channel client ID (confirmed from this shop's Trekkie config).
// The headless ID "12875497473" routes to a separate bucket not shown in Shopify Analytics.
const HEADLESS_APP_CLIENT_ID = "580111";
const VISITOR_COOKIE = "_shopify_y";
const SESSION_COOKIE = "_shopify_s";
const SESSION_MAX_AGE = 30 * 60;
const VISITOR_MAX_AGE = 365 * 24 * 60 * 60;
const COOKIE_DOMAIN = ".theonvor.com";

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
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Domain=${COOKIE_DOMAIN}; Max-Age=${maxAge}; SameSite=Lax`;
}

export function initShopifySessionCookies(): { y: string; s: string } {
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

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return;

  try {
    const cookies = initShopifySessionCookies();
    const now = Date.now();
    const loc = window.location;

    const body = JSON.stringify({
      events: [
        {
          schema_id: "trekkie_storefront_page_view/1.4",
          payload: {
            appClientId: HEADLESS_APP_CLIENT_ID,
            hydrogenSubchannelId: "0",
            isMerchantRequest: false,
            isPersistentCookie: true,
            pageType: params.pageType,
            resourceType: params.pageType === "product" ? "product" : undefined,
            resourceId: undefined,
            customerId: 0,
            url: params.url,
            path: loc.pathname,
            search: loc.search || "",
            referrer: params.referrer,
            title: document.title,
            shopId: SHOP_ID,
            currency: "PKR",
            contentLanguage: "en",
            uniqToken: cookies.y,
            visitToken: cookies.s,
            microSessionId: generateUUID(),
            microSessionCount: 1,
          },
          metadata: {
            event_created_at_ms: now,
            event_sent_at_ms: now,
          },
        },
      ],
    });

    fetch("/api/shopify-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // non-critical
  }
}
