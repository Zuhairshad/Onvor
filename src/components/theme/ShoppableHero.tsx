"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const COPY = {
  heading: "MOTION — Drop One",
  subheading: "Unisex Cotton Basics",
  href: "/collections/all-products",
  cta: "Shop the collection",
} as const;

export function ShoppableHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Buffer video at top priority immediately on mount
    video.preload = "auto";
    video.load();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      aria-label={COPY.heading}
    >
      {/* Hero Video Box */}
      <div className="relative w-full aspect-[9/16] min-h-[720px] max-h-[96vh] imp:aspect-[16/9] imp:min-h-[880px] imp:max-h-[95vh]">
        <video
          ref={videoRef}
          poster="/onvor/hero/hero-video-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="ONVOR Motion Collection Hero Video"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/onvor/hero/hero-video-mobile.webm" type="video/webm" />
          <source src="/onvor/hero/hero-video-mobile.mp4" type="video/mp4" />
        </video>

        {/* Cinematic gradient overlays for header & CTA readability */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-50% to-black/60 z-[1]"
          aria-hidden
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 z-[2] flex flex-col justify-end items-center pb-10 imp:pb-16 px-4 text-center">
          <div className="max-w-xl text-white hero-text-shadow flex flex-col items-center">
            <span className="text-[11px] imp:text-[13px] font-bold tracking-[0.25em] uppercase text-white/90 mb-4">
              {COPY.subheading}
            </span>
            <Link
              href={COPY.href}
              className="inline-block rounded-full bg-white px-10 py-4 text-[12px] font-bold tracking-[0.18em] text-black uppercase shadow-lg transition-all hover:bg-white/90 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {COPY.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

