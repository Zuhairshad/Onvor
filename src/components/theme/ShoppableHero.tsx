import Link from "next/link";

import { AzadiSaleTicker } from "@/components/theme/AzadiSaleTicker";

/**
 * The homepage's top section: a full-bleed Azadi Sale card - solid green
 * ground with an animated text sequence in the outfitters.com.pk style,
 * plus a CTA anchored at the bottom.
 */
const AZADI_GREEN = "#0f5132";

const COPY = {
  heading: "Azadi Sale",
  href: "/collections/all-products",
  cta: "Shop the sale",
} as const;

export function ShoppableHero() {
  return (
    <section
      className="relative w-full"
      aria-label={COPY.heading}
      style={{ backgroundColor: AZADI_GREEN }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: AZADI_GREEN }}
      >
        <div className="relative aspect-[1333/1833] w-full imp:aspect-[1.917/1]">
          <AzadiSaleTicker />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-[36px] imp:pb-[56px]">
            <Link
              href={COPY.href}
              className="pointer-events-auto inline-block rounded-full bg-white px-10 py-3.5 text-[12px] font-bold tracking-[0.18em] text-black uppercase shadow-md transition-all hover:bg-white/90 hover:shadow-lg active:scale-95"
            >
              {COPY.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
