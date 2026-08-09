import { getImageProps } from "next/image";
import Link from "next/link";

import { HeroHotspot, type Hotspot } from "@/components/theme/HeroHotspot";
import { Reveal } from "@/components/theme/Reveal";

/**
 * The homepage's top section: a full-bleed campaign frame with the header riding
 * transparently over it, copy bottom-left and a `+` hotspot on the garment.
 *
 * The frame is Onvor's own SUMMER'26 banner. That art already carries a headline
 * and a "Shop now", so the copy overlaid here is a second set - a deliberate
 * choice, not an oversight. Everything below is arranged around keeping the two
 * out of each other's way:
 *
 *  - The desktop crop is tuned, not centred. Measured against the artwork, its
 *    type runs x 12–49% and the model x 69–82%; the window keeps both and throws
 *    away only the empty wall at either end.
 *  - The copy sits low enough to clear the baked "Shop now", which bottoms out at
 *    73% of the frame height.
 *  - Below 769px the copy stacks under the media, as the reference does, so the
 *    portrait art shows whole with nothing over it.
 *
 * Desktop and mobile are separate frames, cut for 2.556:1 and 0.727:1. One
 * cropped two ways cannot work: the landscape is 150px tall on a phone and its
 * type is unreadable, and cropping it to portrait cuts that type off. They go
 * through `getImageProps` into a `<picture>` so the browser downloads one and not
 * both - a `display: none` image is still fetched.
 */
const DESKTOP = { src: "/onvor/hero/men-desktop.jpg", width: 2400, height: 939 };
const MOBILE = { src: "/onvor/hero/men-mobile.jpg", width: 1000, height: 1375 };

const ALT = "Onvor Summer '26 - model in an olive loose-fit tee under neon tubes";

/**
 * The garment in the frame, matched to the catalog by the shoot: the product's
 * own photography is the same model, cap and tee in the same room.
 */
const HOTSPOTS: Hotspot[] = [
  {
    handle: "olive-green-beach-escape-tee",
    title: "Olive Green Beach Escape Tee",
    price: "1749.30",
    // Centre of the tee. Desktop percentages are of the *cropped* window rather
    // than the source: the crop keeps x 10–85%, so the tee's 76% lands at 88%.
    top: 45,
    left: 88,
    topMobile: 42,
    leftMobile: 50,
  },
];

const COPY = {
  heading: "Easy by design",
  body: "Unisex basics in 100% cotton - loose-fit tees and relaxed trousers built to wear every day.",
  href: "/collections/all-products",
  cta: "Shop all",
} as const;

function HeroPicture() {
  const common = { alt: ALT, sizes: "100vw", quality: 82 } as const;
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, ...DESKTOP });
  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, ...MOBILE });

  return (
    <picture>
      <source media="(min-width: 769px)" srcSet={desktopSrcSet} />
      <source srcSet={mobileSrcSet} />
      <img
        {...rest}
        // `rest` already carries this; naming it keeps the lint rule able to see it.
        alt={ALT}
        loading="eager"
        fetchPriority="high"
        className="h-full w-full object-cover object-[40%_50%]"
      />
    </picture>
  );
}

export function ShoppableHero() {
  return (
    <section className="relative w-full" aria-label={COPY.heading}>
      <div className="relative w-full overflow-hidden">
        {/* Portrait below 769px, a 1.917:1 landscape above it. That ratio is what
            keeps the artwork's type and the model both inside the frame once the
            empty wall at either end is cropped away. Being a ratio rather than a
            height, the hero is the same shape on a 12" laptop as on a 16" one,
            and it reserves its space before the image decodes. */}
        <div className="relative aspect-[1333/1833] w-full imp:aspect-[1.917/1]">
          <HeroPicture />

          {/* --kit-color-mix-tint-overlay: 10% */}
          <div className="absolute inset-0 bg-black/10" aria-hidden />

          {/* A scrim under the overlaid header, as the reference has. Needed here
              rather than optional: a neon tube crosses the top-right of the frame
              and the nav sat white-on-white over it. Desktop only - the header is
              solid below 769px. */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-[190px] bg-gradient-to-b from-black/50 via-black/20 to-transparent imp:block"
            aria-hidden
          />

          {HOTSPOTS.map((spot) => (
            <HeroHotspot key={spot.handle} spot={spot} />
          ))}

          {/* Content sits bottom-left on desktop (--com-place: end start).
              No standfirst here, unlike the stacked mobile version below. The
              artwork's own "Shop now" bottoms out at 73% of the frame, leaving
              27% for our copy - and 27% of the frame is a shrinking number of
              pixels as the viewport narrows, while a block of text is not. Two
              lines fit a 15" laptop and collide on a 12". Heading and button
              alone clear it at every width, which is the point. */}
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

      {/* Below 769px the reference stacks the copy under the media instead of
          overlaying it (--com-layout: stack-below), which also leaves the portrait
          artwork's own type unobstructed. */}
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
