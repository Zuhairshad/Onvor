import { getConsentPreferences } from "./consent";
import type { AttributionData } from "./types";

const FIRST_TOUCH_KEY = "onvor_attribution_first";
const LAST_TOUCH_KEY = "onvor_attribution_last";
const ATTRIBUTION_COOKIE = "onvor_attribution";

/**
 * Parses attribution parameters from the current window location and referrer.
 * Only stores data in persistent storage/cookies if marketing/analytics consent is granted.
 */
export function captureAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null;

  try {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const utm_source = params.get("utm_source");
    const utm_medium = params.get("utm_medium");
    const utm_campaign = params.get("utm_campaign");
    const utm_term = params.get("utm_term");
    const utm_content = params.get("utm_content");
    const gclid = params.get("gclid");
    const fbclid = params.get("fbclid");
    const ttclid = params.get("ttclid");

    const hasMarketingParams = Boolean(
      utm_source || utm_medium || utm_campaign || utm_term || utm_content || gclid || fbclid || ttclid,
    );

    const referrer = document.referrer || "";
    const isExternalReferrer =
      referrer && !referrer.includes(window.location.hostname);

    if (!hasMarketingParams && !isExternalReferrer) {
      return getStoredAttribution();
    }

    const currentTouch: AttributionData = {
      utm_source: utm_source || (isExternalReferrer ? new URL(referrer).hostname : null),
      utm_medium: utm_medium || (isExternalReferrer ? "referral" : null),
      utm_campaign,
      utm_term,
      utm_content,
      gclid,
      fbclid,
      ttclid,
      landing_page: window.location.pathname + window.location.search,
      referrer: referrer || null,
      timestamp: Date.now(),
    };

    // Check user consent preferences before persisting
    const consent = getConsentPreferences();
    if (!consent.decided || (!consent.analytics && !consent.marketing)) {
      // Consent not granted or undecided: do not persist to storage or cookie
      return currentTouch;
    }

    // Store first-touch if not already set
    if (!window.localStorage.getItem(FIRST_TOUCH_KEY)) {
      window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(currentTouch));
    }

    // Always update last-touch if incoming has marketing signals
    if (hasMarketingParams || isExternalReferrer) {
      window.localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(currentTouch));
      window.sessionStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(currentTouch));
    }

    // Set cookie for server-side cart hydration
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const compactCookieValue = encodeURIComponent(JSON.stringify(currentTouch));
    document.cookie = `${ATTRIBUTION_COOKIE}=${compactCookieValue}; Path=/; Expires=${expiry.toUTCString()}; SameSite=Lax`;

    return currentTouch;
  } catch (err) {
    console.debug("[Attribution Capture Notice]", err);
    return null;
  }
}

/**
 * Retrieves the most relevant marketing attribution (last-touch preferred, falling back to first-touch).
 */
export function getStoredAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null;

  try {
    const last = window.sessionStorage.getItem(LAST_TOUCH_KEY) || window.localStorage.getItem(LAST_TOUCH_KEY);
    if (last) return JSON.parse(last) as AttributionData;

    const first = window.localStorage.getItem(FIRST_TOUCH_KEY);
    if (first) return JSON.parse(first) as AttributionData;

    const match = document.cookie.match(new RegExp(`(?:^|; )${ATTRIBUTION_COOKIE}=([^;]*)`));
    if (match && match[1]) {
      return JSON.parse(decodeURIComponent(match[1])) as AttributionData;
    }
  } catch {
    // no-op
  }
  return null;
}

/**
 * Formats attribution data as Shopify cart attributes (Key-Value pairs).
 */
export function formatCartAttributes(attr?: AttributionData | null): Array<{ key: string; value: string }> {
  const data = attr || getStoredAttribution();
  if (!data) return [];

  const attributes: Array<{ key: string; value: string }> = [];
  if (data.utm_source) attributes.push({ key: "_utm_source", value: data.utm_source });
  if (data.utm_medium) attributes.push({ key: "_utm_medium", value: data.utm_medium });
  if (data.utm_campaign) attributes.push({ key: "_utm_campaign", value: data.utm_campaign });
  if (data.utm_term) attributes.push({ key: "_utm_term", value: data.utm_term });
  if (data.utm_content) attributes.push({ key: "_utm_content", value: data.utm_content });
  if (data.gclid) attributes.push({ key: "_gclid", value: data.gclid });
  if (data.fbclid) attributes.push({ key: "_fbclid", value: data.fbclid });
  if (data.ttclid) attributes.push({ key: "_ttclid", value: data.ttclid });
  if (data.landing_page) attributes.push({ key: "_landing_page", value: data.landing_page });
  if (data.referrer) attributes.push({ key: "_referrer", value: data.referrer });

  return attributes;
}

/**
 * Appends marketing attribution query parameters to checkout URL.
 */
export function appendAttributionToUrl(baseUrl: string, attr?: AttributionData | null): string {
  const data = attr || getStoredAttribution();
  if (!data || !baseUrl) return baseUrl;

  try {
    const url = new URL(baseUrl);
    if (data.utm_source && !url.searchParams.has("utm_source")) url.searchParams.set("utm_source", data.utm_source);
    if (data.utm_medium && !url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", data.utm_medium);
    if (data.utm_campaign && !url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", data.utm_campaign);
    if (data.utm_term && !url.searchParams.has("utm_term")) url.searchParams.set("utm_term", data.utm_term);
    if (data.utm_content && !url.searchParams.has("utm_content")) url.searchParams.set("utm_content", data.utm_content);
    if (data.gclid && !url.searchParams.has("gclid")) url.searchParams.set("gclid", data.gclid);
    if (data.fbclid && !url.searchParams.has("fbclid")) url.searchParams.set("fbclid", data.fbclid);
    if (data.ttclid && !url.searchParams.has("ttclid")) url.searchParams.set("ttclid", data.ttclid);
    return url.toString();
  } catch {
    return baseUrl;
  }
}
