import type { Metadata } from "next";

import { ContactForm } from "@/components/theme/ContactForm";
import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { CONTACT } from "@/lib/content/onvor";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Onvor by email or WhatsApp, 10am–6pm Monday to Saturday.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="Contact"
        intro="Questions about a fit, an order or an exchange — we answer quickly."
      />

      <div className="page-width pt-10 pb-16">
        <div className="flex flex-col gap-10 imp:flex-row imp:gap-[60px]">
          {/* Details first: these are the channels the store actually monitors. */}
          <div className="imp:flex-[0_1_40%]">
            <h2 className="text-[21px]">Talk to us</h2>
            <dl className="mt-4 space-y-4 text-[15px]">
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
                <dd className="m-0 mt-1">
                  <a
                    href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "").replace(/^0/, "92")}`}
                    target="_blank"
                    rel="noopener"
                    className="underline"
                  >
                    {CONTACT.whatsapp}
                  </a>
                </dd>
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
          </div>

          <div className="imp:flex-[0_1_60%]">
            <h2 className="text-[21px]">Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
