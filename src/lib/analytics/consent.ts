export type ConsentPreferences = {
  essential: true; // Always true
  analytics: boolean;
  marketing: boolean;
  decided: boolean; // Whether the user has made an explicit choice
  timestamp: number;
};

const CONSENT_STORAGE_KEY = "onvor_consent_preferences";
const CONSENT_COOKIE_KEY = "onvor_consent";

const DEFAULT_PREFERENCES: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  decided: false,
  timestamp: 0,
};

let memoryConsent: ConsentPreferences | null = null;
const listeners = new Set<(consent: ConsentPreferences) => void>();

/**
 * Reads current consent preferences from memory, localStorage, or cookie.
 */
export function getConsentPreferences(): ConsentPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  if (memoryConsent) return memoryConsent;

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ConsentPreferences;
      memoryConsent = { ...parsed, essential: true };
      return memoryConsent;
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_KEY}=([^;]*)`));
    if (match && match[1]) {
      const parsed = JSON.parse(decodeURIComponent(match[1])) as ConsentPreferences;
      memoryConsent = { ...parsed, essential: true };
      return memoryConsent;
    }
  } catch {
    // fallback
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Updates user consent preferences, persists them, updates provider consent modes, and notifies listeners.
 */
export function setConsentPreferences(prefs: { analytics: boolean; marketing: boolean }): ConsentPreferences {
  const updated: ConsentPreferences = {
    essential: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    decided: true,
    timestamp: Date.now(),
  };

  memoryConsent = updated;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 365); // 1-year consent persistence
      document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(updated))}; Path=/; Expires=${expiry.toUTCString()}; SameSite=Lax`;

      // Update Google Consent Mode v2
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: updated.analytics ? "granted" : "denied",
          ad_storage: updated.marketing ? "granted" : "denied",
          ad_user_data: updated.marketing ? "granted" : "denied",
          ad_personalization: updated.marketing ? "granted" : "denied",
        });
      }

      // Update Meta Pixel consent
      if (typeof window.fbq === "function") {
        if (updated.marketing) {
          window.fbq("consent", "grant");
        } else {
          window.fbq("consent", "revoke");
        }
      }

      // Update TikTok Pixel consent
      if (typeof window.ttq === "object" && window.ttq) {
        if (updated.marketing && typeof window.ttq.grantConsent === "function") {
          window.ttq.grantConsent();
        } else if (!updated.marketing && typeof window.ttq.holdConsent === "function") {
          window.ttq.holdConsent();
        }
      }

      // Notify listeners
      listeners.forEach((listener) => listener(updated));
      window.dispatchEvent(new CustomEvent("onvor:consent_changed", { detail: updated }));
    } catch (err) {
      console.debug("[Consent Store Notice]", err);
    }
  }

  return updated;
}

/**
 * Subscribes to consent changes.
 */
export function subscribeConsent(listener: (consent: ConsentPreferences) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Opens the consent preferences modal.
 */
export function openConsentPreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("onvor:open_consent_modal"));
  }
}
