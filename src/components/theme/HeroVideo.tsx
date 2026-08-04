import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

const VIDEO_ID = "kAaV5gfdsG0";

const EMBED_PARAMS = new URLSearchParams({
  autoplay: "1",
  mute: "1",
  loop: "1",
  playlist: VIDEO_ID,
  controls: "0",
  showinfo: "0",
  modestbranding: "1",
  rel: "0",
  disablekb: "1",
  playsinline: "1",
  iv_load_policy: "3",
});

/**
 * "Made to move with ease" — full-bleed video hero.
 *
 * A still frame sits under the iframe so the hero still reads if the embed is
 * slow, blocked or unavailable; without it a failed embed paints its own opaque
 * error page and the white copy lands on near-white.
 *
 * Unlike the dresses hero this section has no flat overlay — the reference keeps
 * the frame clean and relies on `hero__text-shadow` (a soft radial scrim behind
 * the copy) for legibility instead.
 */
export function HeroVideo() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#c9c7c2]"
      style={{ height: "var(--hero-height)" }}
      aria-label="Made to move with ease"
    >
      <Image
        src="/images/hero-video-poster.jpg"
        alt=""
        width={1280}
        height={720}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 16:9 iframe scaled to cover the box so no letterboxing shows. */}
      <iframe
        className="pointer-events-none absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        src={`https://www.youtube.com/embed/${VIDEO_ID}?${EMBED_PARAMS.toString()}`}
        title="Made to move with ease"
        aria-hidden
        tabIndex={-1}
        allow="autoplay; encrypted-media"
      />

      <div className="absolute inset-0 z-[3] flex items-center justify-center">
        <div className="page-width">
          <Reveal className="flex justify-center py-[15px] text-center">
            <div className="hero-text-shadow max-w-[46rem] text-white">
              <h2 className="font-heading text-[30px] leading-[1.1] font-medium imp:text-[60px]">
                Made to move with ease
              </h2>
              <p className="mt-[15px] mb-[30px] text-[21px]">
                Quiet texture, warm light, and pieces designed for slower days.
              </p>
              <Link
                href="/pages/the-lookbook"
                className="btn border-announcement bg-announcement hover:bg-announcement text-black"
              >
                Explore the lookbook
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
