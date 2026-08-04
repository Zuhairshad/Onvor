import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

const HREF = "/collections/2026-dresses";

/**
 * "Easy to wear, easy to return to" — full-bleed image hero with the
 * reference's 20%-black overlay between the photo and the text.
 */
export function SlideshowHero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "var(--hero-height)" }}
      aria-label="Easy to wear, easy to return to"
    >
      <Image
        src="/images/hero-dresses.jpg"
        alt=""
        width={2400}
        height={1215}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* colorImageOverlay: #000 at 0.2 */}
      <div className="absolute inset-0 bg-black opacity-20" aria-hidden />

      {/* The reference makes the whole slide clickable; the visible button stays
          the accessible control, so this stays out of the tab order. */}
      <Link
        href={HREF}
        className="absolute inset-0 z-[2]"
        aria-hidden
        tabIndex={-1}
      />

      <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
        <div className="page-width">
          <Reveal className="flex justify-center py-[15px] text-center">
            <div className="hero-text-shadow max-w-[46rem] text-white">
              <h2 className="font-heading text-[21.5px] leading-[1.1] font-medium imp:text-[43px]">
                Easy to wear, easy to return to
              </h2>
              <p className="mt-[15px] mb-[30px] text-[21px]">
                Soft shapes and understated details for everyday dressing and smaller
                occasions.
              </p>
              <Link href={HREF} className="btn btn--inverse pointer-events-auto">
                Shop dresses
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
