"use client";

import Link from "next/link";
import { useEffect } from "react";

import { CONTACT } from "@/lib/content/onvor";

/**
 * Route-level error boundary.
 *
 * Without one, a thrown error in any segment shows Next's default screen - no
 * chrome, no way back, and on a store that means a lost sale with no route to
 * the people who could rescue it. The header and footer are deliberately not
 * rendered here: if the failure is in a shared component, rendering it again
 * inside the fallback fails the fallback too.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on a production error, where the message is
    // redacted. Logging it here is what makes a report traceable in the logs.
    console.error("Route error", error.digest, error);
  }, [error]);

  return (
    <main id="MainContent" className="flex-1">
      <div className="page-width py-20 text-center imp:py-[110px]">
        <h1 className="m-0">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-[38rem]">
          That is on us, not you. Try again - and if it keeps happening, message us and we
          will sort it out.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn">
            Try again
          </button>
          <Link
            href="/"
            className="btn border-ink text-ink bg-transparent hover:bg-transparent"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-[14px]">
          <a href={`mailto:${CONTACT.email}`} className="underline">
            {CONTACT.email}
          </a>
          <span className="px-2 opacity-40">·</span>
          WhatsApp {CONTACT.whatsapp}
        </p>

        {error.digest ? (
          <p className="mt-4 text-[12px] opacity-50">Reference: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
