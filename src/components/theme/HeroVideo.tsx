import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";
import { NEWSLETTER } from "@/lib/content/onvor";

export function HeroVideo() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#1d2a2e]"
      style={{ height: "var(--hero-height)" }}
      aria-label={NEWSLETTER.heading}
    >
      <Image
        src="/onvor/azadi-promo-model.png"
        alt=""
        width={1672}
        height={941}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "70% 0%" }}
      />

      <div className="absolute inset-0 z-[3] flex items-center">
        <div className="page-width">
          <Reveal className="flex justify-center py-[15px] text-center imp:justify-start imp:text-left">
            <div className="hero-text-shadow max-w-[36rem] text-white">
              <h2 className="font-heading text-[30px] leading-[1.1] font-medium imp:text-[54px]">
                {NEWSLETTER.heading}
              </h2>
              <p className="mt-[15px] mb-[30px] text-[18px] imp:text-[21px]">
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
