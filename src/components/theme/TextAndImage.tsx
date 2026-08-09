import Link from "next/link";

import { ImageReveal } from "@/components/theme/ImageReveal";
import { Reveal } from "@/components/theme/Reveal";
import { BRAND } from "@/lib/content/onvor";

const HREF = "/collections/all-products";

/**
 * "Clothing that simply works" - text beside a three-tile stacked image reveal.
 *
 * The tile column keeps a bounded max-width and reserves its own square via
 * ImageReveal, so the sibling text column has stable geometry and the fan-out
 * never overflows into the copy.
 */
export function TextAndImage() {
  return (
    <section className="index-section">
      <div className="page-width overflow-hidden">
        <div className="mx-0 grid grid-cols-1 items-center gap-10 imp:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] imp:gap-[80px] min-[1050px]:mx-[6%]">
          {/* Text */}
          <div className="order-2 min-w-0 px-[20px] text-left imp:order-none imp:p-0">
            <Reveal>
              <h2>Clothing that simply works</h2>
              <p>{BRAND.positioning}</p>
            </Reveal>
            <Reveal delay={1}>
              <Link href={HREF} className="btn mt-[15px]">
                Shop all
              </Link>
            </Reveal>
          </div>

          {/* Three-tile reveal */}
          <div className="min-w-0 px-[20px] imp:px-0">
            <Reveal delay={1}>
              <ImageReveal
                leftImage="/onvor/lifestyle-1.jpg"
                middleImage="/onvor/lifestyle-2.jpg"
                rightImage="/onvor/lifestyle-3.jpg"
                alt="Onvor lifestyle"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
