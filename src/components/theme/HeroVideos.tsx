"use client";

import { useEffect, useRef } from "react";

type Props = {
  portraitSrc: string;
  landscapeSrc: string;
  portraitPoster: string;
  landscapePoster: string;
  alt: string;
};

/**
 * Two viewport-specific `<video>` tags for the hero. A shared IntersectionObserver
 * pauses whichever one is currently visible once the hero scrolls off screen so
 * the tab stops burning CPU/battery on a loop nobody's watching, and resumes it
 * when the hero comes back into view.
 */
export function HeroVideos({
  portraitSrc,
  landscapeSrc,
  portraitPoster,
  landscapePoster,
  alt,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const portraitRef = useRef<HTMLVideoElement | null>(null);
  const landscapeRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const videos = [portraitRef.current, landscapeRef.current];
        for (const v of videos) {
          if (!v) continue;
          if (entry.isIntersecting) {
            /* Only play the one the current viewport is actually showing -
               the other is display:none so play() would be wasted work. */
            if (v.offsetParent !== null) v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      /* A small negative rootMargin means we don't churn play/pause right at
         the boundary - the video keeps playing until the hero is meaningfully
         off screen. */
      { threshold: 0, rootMargin: "-10% 0px" },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="contents">
      <video
        ref={portraitRef}
        src={portraitSrc}
        poster={portraitPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={alt}
        className="absolute inset-0 h-full w-full object-cover imp:hidden"
      />
      <video
        ref={landscapeRef}
        src={landscapeSrc}
        poster={landscapePoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={alt}
        className="absolute inset-0 hidden h-full w-full object-cover imp:block"
      />
    </div>
  );
}
