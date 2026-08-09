import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/theme/PageShell";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "How Onvor sources cotton, cuts waste on the pattern table and packs orders without single-use plastic.",
};

/**
 * Editorial content page. Text is intentionally specific to what Onvor actually
 * does today - vague "eco" claims fail Pakistan's Competition Act and read as
 * greenwashing. Update the numbers when suppliers or processes change.
 */
const SECTIONS = [
  {
    title: "Cotton, and only cotton",
    body: "Every Onvor garment is cut from 100% cotton milled in Faisalabad. We stay with a small group of mills we have visited so we can trace a bolt of fabric back to the ginner, not just the merchant.",
  },
  {
    title: "Cutting the waste before it happens",
    body: "The loose-fit block was drafted to nest cleanly on a 58-inch roll, which is why the same tee is offered in only five sizes. Fewer sizes means tighter markers, which means less offcut - the industry average is around 15% fabric loss; our current cut runs at 8%.",
  },
  {
    title: "Water, dye and finishing",
    body: "We work with a ZDHC-registered dye house and only use reactive dyes with published safety data. Undyed styles (natural, off-white) skip that step entirely, which is why they price lower.",
  },
  {
    title: "Packaging",
    body: "Orders ship in a recycled kraft mailer with a paper tape closure. The hangtag is on a cotton string, not plastic. If a plastic polybag appears in your parcel it will have arrived on the garment from the mill - we are working with them to phase it out.",
  },
  {
    title: "What we have not solved yet",
    body: "Cotton is thirsty. Our cotton is grown in Punjab, where the water table is falling, and we are not yet in a position to claim BCI or organic certification. We would rather say that plainly than badge the site with a symbol we have not earned.",
  },
];

export default function SustainabilityPage() {
  return (
    <PageShell>
      <PageHeader
        title="Sustainability"
        intro="A short, honest account of how Onvor is made - the parts we are proud of, and the parts we are still working on."
      />

      <div className="page-width max-w-[820px] pt-8 pb-16">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="m-0 text-[24px]">{section.title}</h2>
              <p className="mt-3 mb-0 text-[15px] leading-relaxed opacity-85">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-[14px] opacity-70">
          Questions or corrections?{" "}
          <Link href="/pages/contact" className="underline">
            Write to us
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
