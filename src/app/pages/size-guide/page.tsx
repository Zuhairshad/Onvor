import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { CONTACT, SIZE_GUIDE } from "@/lib/content/onvor";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "How Onvor's loose unisex fit runs, and how to measure to be sure.",
};

/**
 * Size guide.
 *
 * The measurement cells are intentionally empty. The live store's size-guide page
 * is unedited theme filler, so there is nothing real to carry over, and inventing
 * garment measurements would send people the wrong size. The sizes, the fit
 * guidance and the how-to-measure notes are real; the numbers need Onvor's spec
 * sheet.
 */
function Table({ label, columns }: { label: string; columns: readonly string[] }) {
  return (
    <div className="mt-8">
      <h3 className="text-[19px]">{label}</h3>
      {/* A size chart is the one thing here that cannot reflow to 320px and stay
          readable, so it scrolls sideways instead of squeezing. On a phone that
          scroll has no visible affordance until you touch it, hence the hint. */}
      <p className="mt-1 mb-0 text-[13px] opacity-60 imp:hidden">
        Swipe the table sideways for every column.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-hairline border-b">
              <th scope="col" className="tracking-caps py-3 pr-4 text-[13px] uppercase">
                Size
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="tracking-caps py-3 pr-4 text-[13px] uppercase"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_GUIDE.sizes.map((size) => (
              <tr key={size} className="border-hairline border-b">
                <th scope="row" className="py-3 pr-4 font-normal">
                  {size}
                </th>
                {columns.map((c) => (
                  <td key={c} className="py-3 pr-4 opacity-40">
                    —
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <PageShell>
      <PageHeader title="Size Guide" intro={SIZE_GUIDE.note} />

      <div className="page-width pt-6 pb-16">
        <div className="border-hairline bg-body-dim mt-4 border p-5 text-[15px]">
          <p className="m-0">
            Measurements for each size are still to be confirmed against Onvor&apos;s spec
            sheet — the table below is laid out and ready for them. Until then, ask us for
            the measurement of any piece:{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline">
              {CONTACT.email}
            </a>{" "}
            or WhatsApp {CONTACT.whatsapp}, {CONTACT.hours}.
          </p>
        </div>

        <Table label="Tops — loose fit tees" columns={SIZE_GUIDE.measurements} />
        <Table label="Bottoms — trousers and shorts" columns={SIZE_GUIDE.bottomsMeasurements} />

        <section className="mt-12">
          <h2 className="text-[21px]">How to measure</h2>
          <p className="mt-2 max-w-[46rem]">
            Lay the garment flat and measure in inches. Comparing against a piece you
            already own is the most reliable way to pick a size.
          </p>
          <dl className="mt-6 grid gap-6 imp:grid-cols-2">
            {SIZE_GUIDE.howToMeasure.map((item) => (
              <div key={item.title}>
                <dt className="tracking-caps text-[13px] uppercase">{item.title}</dt>
                <dd className="m-0 mt-2 text-[15px]">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-12 text-[15px]">
          <Link href="/collections/all-products" className="btn">
            Shop all
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
