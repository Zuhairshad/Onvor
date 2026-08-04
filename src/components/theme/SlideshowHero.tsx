import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

const HREF = "/collections/oversized-tees";

/**
 * Full-bleed image hero with the reference's 20%-black overlay between the photo
 * and the copy. Their editorial frame is portrait, so object-position keeps the
 * model in shot as it crops to the hero's landscape box.
 */
export function SlideshowHero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "var(--hero-height)" }}
      aria-label="Made for repeat wear"
    >
      <Image
        src="/onvor/lifestyle-1.jpg"
        alt=""
        width={1000}
        height={1500}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 30%" }}
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
                Made for repeat wear
              </h2>
              <p className="mt-[15px] mb-[30px] text-[21px]">
                100% cotton loose-fit tees, cut to keep their shape wash after wash.
              </p>
              <Link href={HREF} className="btn btn--inverse pointer-events-auto">
                Shop tees
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
