import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

const HREF = "/blogs/journal";

/**
 * "Inside the journal" — text beside two overlapping images.
 *
 * Faithful to `.feature-row` in the reference, which is fiddlier than it looks:
 *  - the row is inset by `margin: 0 6%` from 1050px up;
 *  - the text column is `flex: 0 1 43%` with a 60px gutter on its right;
 *  - the two images are declared 55% and 60% wide. That totals 115%, so flex
 *    shrink resolves them to ~47.8% / ~52.2% — the overflow is deliberate and
 *    the shrink is what produces the final sizes;
 *  - the overlap is a `translate(50px, 50px)` on the *first* image plus a
 *    z-index, which is what drops the square low and left over the arch.
 *
 * Below 769px the reference puts the images above the text, so the text takes
 * `order: 2`.
 */
export function TextAndImage() {
  return (
    <section className="index-section">
      {/* .feature-row-wrapper */}
      <div className="page-width overflow-hidden">
        <div className="mx-0 flex flex-col items-center justify-between imp:flex-row min-[1050px]:mx-[6%]">
          {/* Text */}
          <div className="order-2 w-full px-[20px] pt-[30px] text-left imp:order-none imp:min-w-[43%] imp:flex-[0_1_43%] imp:p-0 imp:pr-[60px]">
            <Reveal>
              <h2>Inside the journal</h2>
              <p>
                Explore styling ideas, seasonal notes, and content-rich stories that
                bring our collections to life.
              </p>
            </Reveal>
            <Reveal delay={1}>
              <Link href={HREF} className="btn mt-[15px]">
                Read more
              </Link>
            </Reveal>
          </div>

          {/* Images */}
          <div className="w-full px-[20px] pt-[30px] imp:px-0 imp:pt-0 imp:flex-[0_1_50%]">
            <Reveal delay={1}>
              <div className="-ml-[30px] flex items-center justify-between pb-[15px] imp:mx-auto imp:ml-0 imp:py-[50px]">
                {/* First image: square, translated down/right and stacked on top. */}
                <Link
                  href={HREF}
                  className="z-[1] block w-[55%] translate-x-[30px] translate-y-[30px] imp:translate-x-[50px] imp:translate-y-[50px]"
                >
                  <span className="relative block aspect-square overflow-hidden">
                    <Image
                      src="/images/journal-square.jpg"
                      alt=""
                      width={1000}
                      height={1000}
                      sizes="(min-width: 769px) calc(0.4 * 50vw), 40vw"
                      className="h-full w-full object-cover"
                    />
                  </span>
                </Link>

                {/* Second image: 2:3 portrait with the arched top. */}
                <Link href={HREF} className="block w-[60%]">
                  <span className="arch-mask relative block aspect-[2/3]">
                    <Image
                      src="/images/journal-arch.jpg"
                      alt=""
                      width={896}
                      height={1344}
                      sizes="(min-width: 769px) calc(0.6 * 50vw), 60vw"
                      className="h-full w-full object-cover"
                    />
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
