"use client";

import { openConsentPreferences } from "@/lib/analytics";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      className="inline-block py-[9px] text-[14px] text-current underline hover:text-white wide:py-[4px] cursor-pointer bg-transparent border-0 p-0 text-left"
    >
      Cookie settings
    </button>
  );
}
