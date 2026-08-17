"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getConsentPreferences, setConsentPreferences, subscribeConsent, type ConsentPreferences } from "@/lib/analytics";

const SERVER_SNAPSHOT: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  decided: true,
  timestamp: 0,
};

function getServerSnapshot(): ConsentPreferences {
  return SERVER_SNAPSHOT;
}

function emptySubscribe() {
  return () => {};
}

function getClientMounted() {
  return true;
}

function getServerMounted() {
  return false;
}

export function CookieNotice() {
  const consent = useSyncExternalStore(subscribeConsent, getConsentPreferences, getServerSnapshot);
  const isMounted = useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);

  const [showCustomize, setShowCustomize] = useState(false);
  const [customAnalytics, setCustomAnalytics] = useState<boolean | null>(null);
  const [customMarketing, setCustomMarketing] = useState<boolean | null>(null);

  const analyticsChecked = customAnalytics !== null ? customAnalytics : consent.analytics;
  const marketingChecked = customMarketing !== null ? customMarketing : consent.marketing;

  useEffect(() => {
    const handleOpen = () => {
      setCustomAnalytics(null);
      setCustomMarketing(null);
      setShowCustomize(true);
    };

    window.addEventListener("onvor:open_consent_modal", handleOpen);
    return () => window.removeEventListener("onvor:open_consent_modal", handleOpen);
  }, []);

  if (!isMounted) return null;

  const showBanner = !consent.decided && !showCustomize;

  const handleAcceptAll = () => {
    setConsentPreferences({ analytics: true, marketing: true });
    setShowCustomize(false);
    setCustomAnalytics(null);
    setCustomMarketing(null);
  };

  const handleRejectNonEssential = () => {
    setConsentPreferences({ analytics: false, marketing: false });
    setShowCustomize(false);
    setCustomAnalytics(null);
    setCustomMarketing(null);
  };

  const handleSaveCustom = () => {
    setConsentPreferences({ analytics: analyticsChecked, marketing: marketingChecked });
    setShowCustomize(false);
    setCustomAnalytics(null);
    setCustomMarketing(null);
  };

  if (!showBanner && !showCustomize) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Privacy & Cookie Preferences"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[560px] rounded-lg bg-ink p-5 text-white shadow-2xl imp:inset-x-auto imp:right-4 imp:left-auto"
    >
      {!showCustomize ? (
        // --- 1. Main Consent Banner ---
        <div>
          <h3 className="m-0 text-[16px] font-medium tracking-tight">Privacy & Cookie Preferences</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/80">
            We use essential cookies to manage your bag and checkout. With your consent, we also use
            analytics (GA4) and marketing cookies (Meta/TikTok) to improve your experience and deliver relevant drops.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => {
                setCustomAnalytics(consent.analytics);
                setCustomMarketing(consent.marketing);
                setShowCustomize(true);
              }}
              className="text-[12px] text-white/70 underline hover:text-white"
            >
              Customize
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="tracking-caps rounded-btn border border-white/40 px-3 py-2 text-[11px] uppercase text-white hover:bg-white/10"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="tracking-caps rounded-btn bg-white px-4 py-2 text-[11px] font-semibold uppercase text-ink hover:bg-neutral-200"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- 2. Customization Preferences Modal ---
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="m-0 text-[16px] font-medium tracking-tight">Customize Cookie Preferences</h3>
            {consent.decided && (
              <button
                type="button"
                onClick={() => setShowCustomize(false)}
                className="text-[12px] text-white/60 hover:text-white"
                aria-label="Close preferences"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-3 space-y-3 text-[13px]">
            {/* Essential */}
            <div className="flex items-start justify-between gap-3 rounded bg-white/5 p-2.5">
              <div>
                <p className="m-0 font-medium text-white">Strictly Necessary</p>
                <p className="m-0 mt-0.5 text-[11px] text-white/60">
                  Required for cart persistence, secure checkout, and basic store functions.
                </p>
              </div>
              <span className="tracking-caps shrink-0 text-[10px] uppercase text-white/40">Always Active</span>
            </div>

            {/* Analytics */}
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded bg-white/5 p-2.5 hover:bg-white/10">
              <div>
                <p className="m-0 font-medium text-white">Analytics & Performance</p>
                <p className="m-0 mt-0.5 text-[11px] text-white/60">
                  Measures page visits, product browsing, and traffic sources to optimize the storefront.
                </p>
              </div>
              <input
                type="checkbox"
                checked={analyticsChecked}
                onChange={(e) => setCustomAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 accent-white"
              />
            </label>

            {/* Marketing */}
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded bg-white/5 p-2.5 hover:bg-white/10">
              <div>
                <p className="m-0 font-medium text-white">Marketing & Advertising</p>
                <p className="m-0 mt-0.5 text-[11px] text-white/60">
                  Helps measure ad effectiveness on Meta, Google, and TikTok to deliver relevant promotions.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketingChecked}
                onChange={(e) => setCustomMarketing(e.target.checked)}
                className="mt-1 h-4 w-4 accent-white"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={handleRejectNonEssential}
              className="tracking-caps rounded-btn border border-white/40 px-3 py-1.5 text-[11px] uppercase text-white hover:bg-white/10"
            >
              Reject All
            </button>
            <button
              type="button"
              onClick={handleSaveCustom}
              className="tracking-caps rounded-btn bg-white px-4 py-1.5 text-[11px] font-semibold uppercase text-ink hover:bg-neutral-200"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
