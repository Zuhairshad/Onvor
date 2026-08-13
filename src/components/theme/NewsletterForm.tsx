"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { subscribeToNewsletter, type FormResult } from "@/app/actions/contact";
import { trackStorefrontEvent } from "@/components/integrations/ShopifyAutomationScripts";
import { IconEmail } from "@/components/theme/icons";
import { NEWSLETTER } from "@/lib/content/onvor";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="absolute top-1/2 right-0 -translate-y-1/2 p-1 text-white disabled:opacity-50"
    >
      <IconEmail className="h-[24px] w-[26px]" />
      <span className="sr-only">{pending ? "Subscribing" : "Subscribe"}</span>
    </button>
  );
}

/** Footer newsletter signup with community and drop updates. */
export function NewsletterForm() {
  const [state, action] = useActionState<FormResult | null, FormData>(
    subscribeToNewsletter,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      try {
        localStorage.setItem("onvor_subscribed", "true");
      } catch {
        // no-op
      }
      trackStorefrontEvent("customer_subscribed");
    }
  }, [state]);

  return (
    <div className="w-full max-w-[320px]">
      <form action={action} className="relative block w-full">
        <label htmlFor="newsletter-email" className="sr-only">
          Enter your email
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={NEWSLETTER.placeholder}
          className="bg-ink w-full rounded-none border-0 border-b-2 border-white py-[10px] pr-[45px] pl-0 text-white placeholder:text-white placeholder:opacity-100 focus:outline-none"
        />
        <Submit />
      </form>

      {state ? (
        <div className="mt-3 text-[14px]">
          <p className={`mb-1 ${state.ok ? "text-emerald-400 font-medium" : "text-red-300"}`} role="status">
            {state.message}
          </p>
        </div>
      ) : null}
    </div>
  );
}

