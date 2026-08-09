import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { CONTACT, RETURN_POLICY } from "@/lib/content/onvor";

export const metadata: Metadata = {
  title: "Customer Care",
  description:
    "How to reach Onvor, place an order, exchange a piece and get help with shipping.",
  alternates: { canonical: "/pages/customer-care" },
};

/**
 * FAQ / help hub. Deliberately combines the answers a shopper is most likely to
 * want in one screen rather than fanning them out across sub-pages - our order
 * volume does not justify per-topic routes yet.
 */
const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Orders in Pakistan ship the next working day and arrive within 3-5 working days via TCS or Leopards. You will receive a tracking link by email and WhatsApp once the parcel is picked up.",
  },
  {
    q: "Do you deliver internationally?",
    a: "Not yet. If you are ordering from outside Pakistan, write to us and we can quote a courier rate on request.",
  },
  {
    q: "How do I know what size I am?",
    a: "Our loose fit runs true - if you usually wear a medium, order a medium. Compare your favourite tee against the numbers on the Size Guide before ordering anything you are unsure about.",
  },
  {
    q: "Can I exchange or return?",
    a: RETURN_POLICY.points[0],
  },
  {
    q: "My order arrived damaged - what do I do?",
    a: `Send a photograph of the piece and the packaging to ${CONTACT.email} within 48 hours of delivery. We will courier out a replacement at no cost.`,
  },
  {
    q: "How do I pay?",
    a: "We accept card payments through the Shopify checkout, direct bank transfer, and cash on delivery for orders within Pakistan.",
  },
] as const;

export default function CustomerCarePage() {
  return (
    <PageShell>
      <PageHeader
        title="Customer Care"
        intro="Answers to the questions we get most. If yours is not here, get in touch - a person, not a bot, will reply."
      />

      <div className="page-width max-w-[820px] pt-8 pb-16">
        <section className="border-hairline mb-10 grid gap-6 border p-6 imp:grid-cols-3">
          <div>
            <p className="tracking-caps m-0 text-[12px] uppercase opacity-60">Email</p>
            <a href={`mailto:${CONTACT.email}`} className="mt-1 block text-[15px] underline">
              {CONTACT.email}
            </a>
          </div>
          <div>
            <p className="tracking-caps m-0 text-[12px] uppercase opacity-60">WhatsApp</p>
            <a
              href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "").replace(/^0/, "92")}`}
              target="_blank"
              rel="noopener"
              className="mt-1 block text-[15px] underline"
            >
              {CONTACT.whatsapp}
            </a>
          </div>
          <div>
            <p className="tracking-caps m-0 text-[12px] uppercase opacity-60">Hours</p>
            <p className="m-0 mt-1 text-[15px]">{CONTACT.hours}</p>
          </div>
        </section>

        <h2 className="m-0 text-[24px]">Frequently asked</h2>
        <div className="mt-6 divide-y divide-hairline">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="tracking-caps flex cursor-pointer list-none items-center justify-between text-[13px] uppercase">
                {item.q}
                <span aria-hidden className="text-[18px] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 mb-0 text-[15px] leading-relaxed opacity-85">{item.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-12 text-[14px] opacity-70">
          Still stuck?{" "}
          <Link href="/pages/contact" className="underline">
            Send us a message
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
