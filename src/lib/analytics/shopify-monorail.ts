// Shopify requires _shopify_y (visitor) and _shopify_s (session) cookies to attribute
// analytics events to a visitor. Setting Domain=.theonvor.com shares them with
// checkout.theonvor.com so Shopify's checkout can record sessions for converting visitors.
//
// Storefront page view beacons to Shopify's Monorail endpoint are blocked for all
// non-Shopify origins (browser and server both return 405). Full storefront session
// tracking requires Shopify Web Pixels via Shopify Admin > Settings > Customer Events.

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

export function initShopifySessionCookies(): void {
  if (typeof window === "undefined") return;

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return;

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
}
