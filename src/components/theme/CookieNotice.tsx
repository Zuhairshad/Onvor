"use client";

import { useSyncExternalStore } from "react";

/**
 * Informational cookie notice.
 *
 * The only cookie set by the storefront today is `onvor_cart_id`, which is
 * strictly necessary for the cart to survive a page reload - no analytics or
 * marketing cookies are gated behind this. Kept as a small dismissible banner
 * rather than a consent modal so it does not block first-paint or LCP.
 *
 * Dismissal is read via `useSyncExternalStore` so the server-render matches
 * the "dismissed" state and the banner only appears once the client mounts
 * and confirms the flag is absent - no cascading effect, no hydration flash.
 */
const STORAGE_KEY = "cookie-notice-dismissed";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return true;
}

export function CookieNotice() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (dismissed) return null;

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[520px] rounded-lg border border-hairline bg-body p-4 text-[13px] shadow-lg imp:inset-x-auto imp:right-4 imp:left-auto"
    >
      <p className="m-0">
        We use a single cart cookie to remember your bag between visits. No
        tracking or marketing cookies are set.
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={dismiss}
          className="tracking-caps rounded-btn border border-ink px-4 py-2 text-[11px] uppercase"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
