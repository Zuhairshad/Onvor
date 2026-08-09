import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { CONTACT } from "@/lib/content/onvor";

export const metadata: Metadata = { title: "Account" };

/**
 * Accounts are not part of this build.
 *
 * Shopify owns customer identity, and a headless storefront reaches it through
 * the Customer Account API, which needs its own OAuth setup. Rather than ship a
 * sign-in form that cannot authenticate anyone, this says where accounts actually
 * live and offers the two things people come here for.
 */
export default function AccountPage() {
  return (
    <PageShell>
      <PageHeader
        title="Account"
        intro="Order history and saved details live with Shopify, which handles checkout for the store."
      />

      <div className="page-width pt-8 pb-16">
        <div className="mx-auto max-w-[36rem] text-center">
          <p>
            Sign-in is not wired up in this storefront yet - it needs Shopify&apos;s Customer
            Account API. In the meantime, the order confirmation email carries your order
            status and tracking.
          </p>
          <p className="mt-4">
            For anything about an existing order, email{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline">
              {CONTACT.email}
            </a>{" "}
            or WhatsApp {CONTACT.whatsapp}, {CONTACT.hours}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/collections/all-products" className="btn">
              Shop all
            </Link>
            <Link href="/pages/contact" className="btn border-ink text-ink bg-transparent hover:bg-transparent">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
