"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Reveal } from "@/components/theme/Reveal";

const HREF = "/collections/oversized-tees";

/**
 * Full-bleed video hero with the reference's 20%-black overlay between the clip
 * and the copy. Source clip is portrait, so object-position keeps the subject in
 * shot as it crops to the hero's landscape box. Poster paints instantly so the
 * copy has a background before the mp4 hydrates. Playback is gated on scroll —
 * the clip only decodes while the section is on screen, so the video isn't
 * chewing CPU up top when a shopper is nowhere near it.
 */
export function SlideshowHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {
            // Autoplay can be blocked when the tab is backgrounded; ignore.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "var(--hero-height)" }}
      aria-label="Made for repeat wear"
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/onvor/video/repeat-wear-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 50%" }}
      >
        <source src="/onvor/video/repeat-wear.mp4" type="video/mp4" />
      </video>

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
