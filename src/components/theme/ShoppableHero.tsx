"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { IconChevronRight, IconPlus } from "@/components/theme/icons";
import { Reveal } from "@/components/theme/Reveal";
import { formatPkr } from "@/lib/money";

/**
 * The homepage's top section: a full-bleed editorial frame with `+` hotspots that
 * open a small product card.
 *
 * Positions are percentages of the media box, with separate mobile values, the way
 * the reference drives them, so a hotspot stays on its garment as the frame crops.
 *
 * The reference frames three models and hangs three hotspots off them. Onvor's
 * campaign photography is three separate single-model portraits shot in different
 * corners of the same room, so stitching them into one frame leaves a visible
 * seam that blending cannot fix — the backgrounds genuinely do not match. This
 * uses one of their frames as shot.
 *
 * Their frames are 2:3 portraits, so a wide hero can only show a band of one. The
 * crop is set to keep the face and the whole tee in shot, which leaves a single
 * garment to pin, hence one hotspot rather than the reference's three. More
 * hotspots need either wider photography or a taller hero.
 */
type Hotspot = {
  handle: string;
  title: string;
  price: string;
  /** Percent offsets within the media box. */
  top: number;
  left: number;
  topMobile: number;
  leftMobile: number;
};

const HOTSPOTS: Hotspot[] = [
  {
    handle: "stamp-rainbow-tee",
    title: "Stamp Rainbow Tee",
    price: "1679.30",
    // Desktop crops to face-through-tee; mobile shows the full frame, so the
    // garment sits higher in the box there.
    top: 68,
    left: 52,
    topMobile: 62,
    leftMobile: 50,
  },
];

function HotspotMarker({ spot }: { spot: Hotspot }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="hotspot z-[4]"
      style={
        {
          "--hotspot-top": `${spot.top}%`,
          "--hotspot-left": `${spot.left}%`,
          "--hotspot-top-mobile": `${spot.topMobile}%`,
          "--hotspot-left-mobile": `${spot.leftMobile}%`,
        } as CSSProperties
      }
    >
      <button
        type="button"
        aria-label={spot.title}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="bg-announcement flex h-9 w-9 items-center justify-center rounded-full text-black shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform hover:scale-110"
      >
        <IconPlus className="h-3 w-3" />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+8px)] left-1/2 w-[210px] -translate-x-1/2 bg-white text-left shadow-[0_6px_24px_rgba(0,0,0,0.18)]">
          <div className="px-4 pt-3 pb-2">
            <p className="text-ink m-0 text-[15px]">{spot.title}</p>
            <div className="text-ink mt-1 text-[15px]">{formatPkr(spot.price)}</div>
          </div>
          <div className="border-hairline border-t">
            <Link
              href={`/products/${spot.handle}`}
              className="text-ink tracking-caps flex items-center gap-1 px-4 py-3 text-[12px] uppercase"
            >
              View product
              <IconChevronRight className="h-[10px] w-[6px]" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ShoppableHero() {
  return (
    <section className="relative w-full" aria-label="Easy by design">
      <div className="relative w-full overflow-hidden">
        {/* The hero fills the fold. The floor used to be 780px, which is taller
            than a 12" laptop's 720px viewport — the copy and the CTA sat below
            the fold there and above it on a 14". Dropping the floor to 560px
            lets every laptop show the same thing: the frame ending at the fold
            with the copy inside it. */}
        <div className="relative h-[680px] w-full imp:h-[calc(100vh-60px)] imp:max-h-[980px] imp:min-h-[560px]">
          <Image
            src="/onvor/lifestyle-2.jpg"
            alt="Model wearing an Onvor loose-fit printed tee with relaxed straight-fit trousers"
            width={1000}
            height={1500}
            sizes="100vw"
            // The source is 1000x1500 natively, so 95 spends bytes encoding
            // detail that isn't in the file — 82 is visually identical here at
            // roughly a third of the weight.
            quality={82}
            priority
            className="h-full w-full object-cover"
            style={{ objectPosition: "50% 35%" }}
          />

          {/* --kit-color-mix-tint-overlay: 10% */}
          <div className="absolute inset-0 bg-black/10" aria-hidden />

          {HOTSPOTS.map((spot) => (
            <HotspotMarker key={spot.handle} spot={spot} />
          ))}

          {/* Content sits bottom-left on desktop (--com-place: end start). */}
          <div className="absolute inset-0 z-[3] hidden items-end imp:flex">
            <div className="page-width pb-[50px]">
              <Reveal className="max-w-[34rem] text-left text-white">
                <h2 className="font-heading text-[27px] leading-[1.1] font-medium">
                  Easy by design
                </h2>
                <p className="mt-3 mb-5">
                  Unisex basics in 100% cotton — loose-fit tees and relaxed trousers
                  built to wear every day.
                </p>
                <Link
                  href="/collections/all-products"
                  className="btn border-announcement bg-announcement hover:bg-announcement text-black"
                >
                  Shop all
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* Below 769px the reference stacks the copy under the media instead of
          overlaying it (--com-layout: stack-below). */}
      <div className="page-width py-8 imp:hidden">
        <Reveal className="text-left">
          <h2 className="font-heading text-[26px] leading-[1.1] font-medium">
            Easy by design
          </h2>
          <p className="mt-3 mb-5">
            Unisex basics in 100% cotton — loose-fit tees and relaxed trousers built
            to wear every day.
          </p>
          <Link href="/collections/all-products" className="btn">
            Shop all
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
