import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

/**
 * Two half-width promo panels, each a full-bleed image with centred copy over it.
 * Heights step up with the viewport exactly as the reference does: 480px, then
 * 640px from 769px, then 800px from 1140px. Buttons here take the light
 * `#edebe7` treatment rather than the default dark one.
 */
const PANELS = [
  {
    heading: "Built for every day",
    body: "Loose-fit tees in 100% cotton — the ones you reach for without thinking.",
    cta: "Shop tees",
    href: "/collections/oversized-tees",
    src: "/onvor/tile-men.jpg",
    width: 1400,
    height: 548,
  },
  {
    heading: "Relaxed from the waist down",
    body: "Baggy, straight and pleated fits that move the way you do.",
    cta: "Shop bottoms",
    href: "/collections/bottoms",
    src: "/onvor/tile-women.jpg",
    width: 1400,
    height: 548,
  },
] as const;

export function PromoGrid() {
  return (
    <section>
      <div className="flex flex-wrap">
        {PANELS.map((panel, i) => (
          <Reveal
            key={panel.heading}
            delay={(i + 1) as 1 | 2}
            className="relative flex w-full min-h-[480px] items-center justify-center overflow-hidden imp:min-h-[640px] imp:w-1/2 min-[1140px]:min-h-[800px]"
          >
            <Image
              src={panel.src}
              alt=""
              width={panel.width}
              height={panel.height}
              sizes="(min-width: 769px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" aria-hidden />

            {/* Whole panel is clickable; the button stays the accessible control. */}
            <Link
              href={panel.href}
              className="absolute inset-0 z-[2]"
              aria-hidden
              tabIndex={-1}
            />

            <div className="page-width pointer-events-none relative z-[3] text-center">
              <div className="mx-auto max-w-[30rem] text-white">
                <h2 className="m-0">{panel.heading}</h2>
                <p className="mt-3 mb-6">{panel.body}</p>
                <Link
                  href={panel.href}
                  className="btn border-announcement bg-announcement hover:bg-announcement pointer-events-auto text-black"
                >
                  {panel.cta}
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
