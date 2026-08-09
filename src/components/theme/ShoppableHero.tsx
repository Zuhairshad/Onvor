import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

/**
 * The homepage's top section: a full-bleed campaign video with the header
 * riding transparently over it and copy bottom-left.
 *
 * The media is a 12s cut from the SUMMER'26 campaign. Two encodes are shipped
 * so each viewport gets a purpose-cut frame rather than a distorted crop:
 *  - hero-portrait.mp4 (1080x1920) plays whole below 769px
 *  - hero-landscape.mp4 (1920x1004) is a pan-and-scan crop of the same take
 *    that keeps the face, cap and tee inside a 1.917:1 frame from 769px up
 *
 * Each viewport also gets its own poster still, painted eagerly so the LCP is
 * an image and the shopper never sees a black waiting box while the video
 * buffers on a slow connection.
 */
const PORTRAIT_VIDEO = "/onvor/hero/hero-portrait.mp4";
const LANDSCAPE_VIDEO = "/onvor/hero/hero-landscape.mp4";
const PORTRAIT_POSTER = "/onvor/hero/hero-poster.jpg";
const LANDSCAPE_POSTER = "/onvor/hero/hero-poster-landscape.jpg";

const ALT = "Onvor Summer '26 - model in an olive loose-fit tee under neon tubes";

const COPY = {
  heading: "Easy by design",
  body: "Unisex basics in 100% cotton - loose-fit tees and relaxed trousers built to wear every day.",
  href: "/collections/all-products",
  cta: "Shop all",
} as const;

export function ShoppableHero() {
  return (
    <section className="relative w-full" aria-label={COPY.heading}>
      <div className="relative w-full overflow-hidden">
        {/* Portrait below 769px (1333:1833), a 1.917:1 landscape above it,
            plus a 20px min-height bump so the hero reads a touch taller than
            the image treatment it replaced. */}
        <div className="relative aspect-[1333/1833] min-h-[calc(100vw*1833/1333+20px)] w-full imp:aspect-[1.917/1] imp:min-h-[calc(100vw/1.917+20px)]">
          {/* Mobile poster (LCP). Hidden on desktop so only one file is
              downloaded per viewport. */}
          <Image
            src={PORTRAIT_POSTER}
            alt={ALT}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover imp:hidden"
          />
          {/* Desktop poster (LCP). */}
          <Image
            src={LANDSCAPE_POSTER}
            alt={ALT}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="hidden object-cover imp:block"
          />

          {/* Mobile video - portrait fills portrait frame. */}
          <video
            src={PORTRAIT_VIDEO}
            poster={PORTRAIT_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={ALT}
            className="absolute inset-0 h-full w-full object-cover imp:hidden"
          />
          {/* Desktop video - pan-and-scan landscape crop of the same take. */}
          <video
            src={LANDSCAPE_VIDEO}
            poster={LANDSCAPE_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={ALT}
            className="absolute inset-0 hidden h-full w-full object-cover imp:block"
          />

          {/* Kept subtle so the neon reads at its own contrast. */}
          <div className="absolute inset-0 bg-black/10" aria-hidden />

          {/* Scrim under the overlaid header. Neon tubes crossing the top of
              the frame would otherwise render the white nav unreadable. */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-[190px] bg-gradient-to-b from-black/50 via-black/20 to-transparent imp:block"
            aria-hidden
          />

          {/* Copy sits bottom-left on desktop. */}
          <div className="absolute inset-0 z-[3] hidden items-end imp:flex">
            <div className="page-width pb-[48px] pl-[24px]">
              <Reveal className="hero-text-shadow max-w-[32rem] text-left text-white">
                <h2 className="font-heading text-[32px] leading-[1.15] font-medium tracking-tight">
                  {COPY.heading}
                </h2>
                <p className="mt-3 mb-6 text-[16px] leading-relaxed text-white/90 font-normal">
                  {COPY.body}
                </p>
                <Link
                  href={COPY.href}
                  className="inline-block rounded-full bg-white px-8 py-3.5 text-[12px] font-bold tracking-[0.18em] text-black uppercase shadow-md transition-all hover:bg-white/90 hover:shadow-lg active:scale-95"
                >
                  {COPY.cta}
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* Below 769px the copy stacks under the media so the portrait video
          plays whole with nothing over it. */}
      <div className="page-width py-8 imp:hidden">
        <Reveal className="text-left">
          <h2 className="font-heading text-[26px] leading-[1.1] font-medium">
            {COPY.heading}
          </h2>
          <p className="mt-3 mb-5 text-[15px] leading-relaxed text-ink/80">{COPY.body}</p>
          <Link
            href={COPY.href}
            className="inline-block rounded-full bg-ink px-8 py-3.5 text-[12px] font-bold tracking-[0.18em] text-white uppercase shadow transition-all hover:bg-ink-light active:scale-95"
          >
            {COPY.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
