// Session cookies scoped to .theonvor.com so checkout.theonvor.com can read them.
// Page view beacons are proxied through /api/shopify-analytics which forwards to
// checkout.theonvor.com/.well-known/shopify/monorail/unstable/produce_batch —
// the correct headless endpoint (confirmed 207 via server-side POST).

const SHOP_ID = 99646538009;
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

    // Proxy through our server — server-to-server POST to the .well-known Monorail
    // endpoint returns 207 (processed). CORS blocks browser direct POST.
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
