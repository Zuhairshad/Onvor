import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";
import { NEWSLETTER } from "@/lib/content/onvor";

/**
 * Promotional hero carrying Onvor's first-order offer.
 *
 * The reference runs a background video here. Onvor has no brand video, so this
 * uses their own campaign banner as a still frame rather than shipping a
 * placeholder video — the layout, height and light button treatment are the
 * reference's.
 *
 * No flat overlay on this section; legibility comes from `hero-text-shadow`, the
 * soft radial scrim the reference uses for the same job.
 */
export function HeroVideo() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#1d2a2e]"
      style={{ height: "var(--hero-height)" }}
      aria-label={NEWSLETTER.heading}
    >
      <Image
        src="/onvor/hero-banner.jpg"
        alt=""
        width={1250}
        height={1718}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 35%" }}
      />

      <div className="absolute inset-0 z-[3] flex items-center justify-center">
        <div className="page-width">
          <Reveal className="flex justify-center py-[15px] text-center">
            <div className="hero-text-shadow max-w-[46rem] text-white">
              <h2 className="font-heading text-[30px] leading-[1.1] font-medium imp:text-[60px]">
                {NEWSLETTER.heading}
              </h2>
              <p className="mt-[15px] mb-[30px] text-[21px]">
                Subscribe and use code{" "}
                <span className="tracking-caps font-bold uppercase">{NEWSLETTER.code}</span>{" "}
                at checkout. Comfort for everyone.
              </p>
              <Link
                href="/collections/all-products"
                className="btn border-announcement bg-announcement hover:bg-announcement text-black"
              >
                Shop all
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
