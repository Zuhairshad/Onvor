import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/theme/PageShell";

export const metadata: Metadata = {
  title: "Garment Care",
  description:
    "How to wash, dry and store your Onvor pieces so they hold their shape and colour.",
};

/**
 * Care instructions kept in one place so the copy on the neck label, the PDP and
 * this page cannot drift. If the label copy is ever revised, update it here
 * first, then mirror it back to the print file.
 */
const RULES = [
  {
    title: "Wash cold, inside out",
    body: "Machine wash at 30°C on a gentle cycle with similar colours. Turn tees and printed pieces inside out so the surface does not rub against zips.",
  },
  {
    title: "No bleach, no fabric softener",
    body: "Softener coats the fibre and stops cotton from breathing - which is the whole reason you bought it. A capful of white vinegar in the rinse compartment does the same softening job without the film.",
  },
  {
    title: "Air dry in the shade",
    body: "Hang flat or over a bar to keep the shoulders from stretching. Direct sun will lift the colour, especially on naturals and off-whites, so dry indoors or on a shaded balcony when you can.",
  },
  {
    title: "Iron on the reverse",
    body: "Warm iron on the reverse side. If a piece is printed or embroidered, place a cotton cloth between the iron and the graphic.",
  },
  {
    title: "First wash",
    body: "100% cotton will relax by about 3-5% after the first wash. This is expected and is already accounted for in the size chart - do not size up because of it.",
  },
  {
    title: "Storage",
    body: "Fold tees and shorts; hang trousers by the waistband. If you are storing for the season, wash first (moths are attracted to the oils in worn cotton, not the fabric itself) and add a cedar block rather than mothballs.",
  },
];

export default function GarmentCarePage() {
  return (
    <PageShell>
      <PageHeader
        title="Garment Care"
        intro="Cotton lasts if you treat it kindly. These are the same instructions on the neck label, expanded."
      />

      <div className="page-width max-w-[820px] pt-8 pb-16">
        <dl className="m-0 space-y-8">
          {RULES.map((rule) => (
            <div key={rule.title} className="border-l-2 border-ink pl-5">
              <dt className="tracking-caps text-[13px] uppercase">{rule.title}</dt>
              <dd className="m-0 mt-2 text-[15px] leading-relaxed opacity-85">{rule.body}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 border-t border-hairline pt-6">
          <p className="m-0 text-[14px] opacity-70">
            Something happened in the wash?{" "}
            <Link href="/pages/contact" className="underline">
              Get in touch
            </Link>
            {" "}and we will help you sort it.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
