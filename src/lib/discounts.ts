/**
 * Client-side discount code helpers for general promo codes, campaign URLs,
 * and Shopify checkout hand-off.
 */

export function setDiscountCookie(code: string) {
  if (typeof document === "undefined") return;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  document.cookie = `discount_code=${encodeURIComponent(code)}; Path=/; Expires=${expiry.toUTCString()}; SameSite=Lax`;
  try {
    localStorage.setItem("onvor_discount_code", code);
  } catch {
    // no-op
  }
}

export function clearDiscountCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "discount_code=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  try {
    localStorage.removeItem("onvor_discount_code");
  } catch {
    // no-op
  }
}

export function getStoredDiscountCode(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/discount_code=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  try {
    return localStorage.getItem("onvor_discount_code");
  } catch {
    return null;
  }
}
