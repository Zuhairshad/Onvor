"use client";

import { useEffect, useState } from "react";

import { SIZE_GUIDE, SIZE_SPECS } from "@/lib/content/onvor";

/**
 * "Size guide" trigger + right-side drawer. Same slide-in mechanics as the
 * cart drawer, so the shopper can pick a size without losing the PDP scroll
 * position or unmounting the add-to-bag form they were already filling in.
 *
 * The full `/pages/size-guide` route still exists for direct links and SEO;
 * this component simply mirrors its content in an overlay.
 *
 * `productType` optionally hoists the table for the current product to the
 * top of the drawer, so a shopper on a tee PDP doesn't have to scroll past
 * trouser specs to get to the numbers that apply to them.
 */
export function SizeGuideDrawer({ productType }: { productType?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const specs = orderSpecs(SIZE_SPECS, productType);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tracking-caps mt-6 inline-flex items-center gap-2 text-[12px] uppercase underline"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="h-4 w-4"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
        Size guide
      </button>

      <div
        className={[
          "fixed inset-0 z-[70] transition-opacity",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full bg-black/40"
          aria-label="Close size guide"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          className={[
            "text-ink absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-white shadow-xl",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <header className="border-hairline flex items-center justify-between border-b px-5 py-4">
            <h2 className="tracking-caps m-0 text-[13px] uppercase">Size guide</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="tracking-caps text-[13px] uppercase"
            >
              Close
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <p className="mt-0 mb-6 text-[14px] opacity-80">
              Compare these measurements against a garment you already own -
              lay it flat and measure in inches for the most reliable fit.
            </p>

            {specs.map((spec) => (
              <section key={spec.title} className="mb-8 last:mb-0">
                <h3 className="tracking-caps m-0 mb-3 border-b border-ink/70 pb-2 text-[13px] uppercase">
                  {spec.title}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] border-collapse text-center text-[13px]">
                    <thead>
                      <tr className="bg-ink text-white">
                        {spec.columns.map((col, idx) => (
                          <th
                            key={col}
                            scope="col"
                            className={`px-2 py-2 text-[11px] font-medium uppercase tracking-caps ${
                              idx === 0 ? "text-left" : ""
                            }`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {spec.rows.map((row) => (
                        <tr key={row.size}>
                          <th
                            scope="row"
                            className="px-2 py-2 text-left font-medium"
                          >
                            {row.size}
                          </th>
                          {row.values.map((val, idx) => (
                            <td key={idx} className="px-2 py-2">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[12px] italic opacity-60">{spec.note}</p>
              </section>
            ))}

            <section className="border-hairline mt-4 border-t pt-6">
              <h3 className="tracking-caps m-0 mb-4 text-[13px] uppercase">
                How to measure
              </h3>
              <dl className="m-0 space-y-4">
                {SIZE_GUIDE.howToMeasure.map((item) => (
                  <div key={item.title} className="border-l-2 border-ink pl-3">
                    <dt className="tracking-caps text-[12px] uppercase">{item.title}</dt>
                    <dd className="m-0 mt-1 text-[13px] opacity-80">{item.body}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </aside>
      </div>
    </>
  );
}

/**
 * Puts the spec table most likely to match the current product first. The map
 * is intentionally forgiving - Shopify product types on Onvor are inconsistent
 * ("t-shirt" vs "Loose Fit Tee"), so a rough contains check is enough.
 */
function orderSpecs(
  specs: readonly (typeof SIZE_SPECS)[number][],
  productType?: string,
): (typeof SIZE_SPECS)[number][] {
  if (!productType) return [...specs];

  const type = productType.toLowerCase();
  const isTop = /tee|shirt|top/.test(type);
  const isShort = /short/.test(type);
  const isPleated = /pleat/.test(type);
  const isBaggy = /baggy/.test(type);
  const isTrouser = /trouser|pant/.test(type);

  const rank = (spec: (typeof SIZE_SPECS)[number]): number => {
    const title = spec.title.toLowerCase();
    if (isTop && /tee|shirt/.test(title)) return 0;
    if (isShort && /short/.test(title)) return 0;
    if (isPleated && /pleat/.test(title)) return 0;
    if (isBaggy && /baggy/.test(title)) return 0;
    if (isTrouser && /straight|trouser/.test(title)) return 0;
    return 1;
  };

  return [...specs].sort((a, b) => rank(a) - rank(b));
}
