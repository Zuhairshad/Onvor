import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { SIZE_GUIDE, SIZE_SPECS } from "@/lib/content/onvor";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Official Onvor size charts and spec measurements for loose fit tees, trousers, and shorts.",
  alternates: { canonical: "/pages/size-guide" },
};

type SpecTable = (typeof SIZE_SPECS)[number];

function SpecChart({ spec }: { spec: SpecTable }) {
  return (
    <div className="mt-10">
      <div className="border-b-2 border-ink pb-2">
        <h3 className="font-heading text-[22px] font-bold tracking-tight uppercase text-ink">
          {spec.title}
        </h3>
      </div>

      <p className="mt-1 mb-2 text-[13px] text-ink/70 imp:hidden">
        Swipe the table sideways for all measurements.
      </p>

      <div className="mt-4 overflow-x-auto rounded-sm border border-ink/20 shadow-xs">
        <table className="w-full min-w-[500px] border-collapse text-center text-[15px]">
          <thead>
            <tr className="bg-ink text-white">
              {spec.columns.map((col, idx) => (
                <th
                  key={col}
                  scope="col"
                  className={`py-3.5 px-4 font-bold tracking-wider uppercase text-[12px] imp:text-[13px] ${
                    idx === 0 ? "text-left" : ""
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/15 bg-white/50">
            {spec.rows.map((row) => (
              <tr key={row.size} className="hover:bg-white/80 transition-colors">
                <th scope="row" className="py-3.5 px-4 text-left font-bold text-ink">
                  {row.size}
                </th>
                {row.values.map((val, idx) => (
                  <td key={idx} className="py-3.5 px-4 text-ink font-medium">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2.5 text-[12px] italic text-ink/70">
        {spec.note}
      </p>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <PageShell>
      <PageHeader title="Size Guide" intro={SIZE_GUIDE.note} />

      <div className="page-width pt-6 pb-16 max-w-[1200px]">
        <div className="rounded-lg border border-ink/15 bg-white/60 p-6 text-[15px] shadow-xs">
          <p className="m-0 leading-relaxed text-ink">
            <strong>Finding your fit:</strong> Compare these measurements against a garment you already own. Lay your garment flat on a level surface to measure in inches.
          </p>
        </div>

        {/* Spec Charts */}
        <div className="space-y-12 mt-6">
          {SIZE_SPECS.map((spec) => (
            <SpecChart key={spec.title} spec={spec} />
          ))}
        </div>

        {/* How to Measure Section */}
        <section className="mt-16 rounded-xl border border-ink/15 bg-white/40 p-8 shadow-xs">
          <h2 className="font-heading text-[24px] font-bold text-ink mb-2">How to measure</h2>
          <p className="text-[15px] text-ink/80 max-w-[46rem]">
            Lay the garment flat and measure in inches. Comparing against a piece you already own is the most reliable way to pick your size.
          </p>
          <dl className="mt-8 grid gap-6 imp:grid-cols-2">
            {SIZE_GUIDE.howToMeasure.map((item) => (
              <div key={item.title} className="border-l-2 border-ink pl-4">
                <dt className="tracking-caps text-[13px] font-bold uppercase text-ink">{item.title}</dt>
                <dd className="m-0 mt-1.5 text-[14px] leading-relaxed text-ink/80">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 text-center">
          <Link
            href="/collections/all-products"
            className="inline-block rounded-full bg-ink px-9 py-3.5 text-[12px] font-bold tracking-[0.18em] text-white uppercase shadow transition-all hover:bg-ink-light active:scale-95"
          >
            Shop all products
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
