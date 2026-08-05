import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { CONTACT, RETURN_POLICY } from "@/lib/content/onvor";

/**
 * Store policies.
 *
 * Return and contact policies carry the store's own wording — the terms are
 * specific and paraphrasing them would change what customers are promised.
 * Privacy is not reproduced here: the live store's version is Shopify's generated
 * policy and the authoritative copy lives on the store, so this links out rather
 * than shipping a stale duplicate of a legal document.
 */
const POLICIES = ["refund-policy", "privacy-policy", "contact-information"] as const;
type PolicyHandle = (typeof POLICIES)[number];

const TITLES: Record<PolicyHandle, string> = {
  "refund-policy": "Return & Refund",
  "privacy-policy": "Privacy Policy",
  "contact-information": "Contact Information",
};

export function generateStaticParams() {
  return POLICIES.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/policies/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (!POLICIES.includes(handle as PolicyHandle)) return {};
  return { title: TITLES[handle as PolicyHandle] };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[handle]">) {
  const { handle } = await params;
  if (!POLICIES.includes(handle as PolicyHandle)) notFound();
  const policy = handle as PolicyHandle;

  return (
    <PageShell>
      <PageHeader title={TITLES[policy]} align="left" />

      <div className="page-width pt-8 pb-16">
        <div className="max-w-[46rem] text-[16px]">
          {policy === "refund-policy" ? (
            <>
              <p className="font-bold">{RETURN_POLICY.headline}</p>
              <ul className="mt-4 list-disc space-y-3 pl-5">
                {RETURN_POLICY.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <h2 className="mt-8 text-[21px]">Starting an exchange</h2>
              <p className="mt-2">{RETURN_POLICY.howTo}</p>
            </>
          ) : null}

          {policy === "contact-information" ? (
            <dl className="space-y-5">
              <div>
                <dt className="tracking-caps text-[13px] uppercase opacity-60">Email</dt>
                <dd className="m-0 mt-1">
                  <a href={`mailto:${CONTACT.email}`} className="underline">
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="tracking-caps text-[13px] uppercase opacity-60">WhatsApp</dt>
                <dd className="m-0 mt-1">{CONTACT.whatsapp}</dd>
              </div>
              <div>
                <dt className="tracking-caps text-[13px] uppercase opacity-60">
                  Customer service
                </dt>
                <dd className="m-0 mt-1">{CONTACT.customerService}</dd>
              </div>
              <div>
                <dt className="tracking-caps text-[13px] uppercase opacity-60">Hours</dt>
                <dd className="m-0 mt-1">{CONTACT.hours}</dd>
              </div>
            </dl>
          ) : null}

          {policy === "privacy-policy" ? (
            <>
              <p>
                Onvor&apos;s privacy policy is generated and kept current by Shopify, which
                processes orders and payments for the store. Rather than ship a copy that
                can drift out of date, the authoritative version is on the store itself.
              </p>
              <p className="mt-4">
                <a
                  href="https://theonvor.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener"
                  className="btn"
                >
                  Read the privacy policy
                </a>
              </p>
              <p className="mt-6 text-[14px] opacity-70">
                In short: Shopify collects the contact, payment and order details needed to
                fulfil a purchase, plus usage data from the store. Questions go to{" "}
                <a href={`mailto:${CONTACT.email}`} className="underline">
                  {CONTACT.email}
                </a>
                .
              </p>
            </>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
