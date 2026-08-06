"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

const AUTOPLAY_MS = 5000;

type Props = {
  /** One node per slide, already rendered on the server. */
  slides: ReactNode[];
  /** Accessible description of each slide, for the live region. */
  labels: string[];
};

/**
 * Crossfading banner rail.
 *
 * Autoplay pauses on hover, on keyboard focus, and whenever the tab is hidden,
 * and never starts under `prefers-reduced-motion` — an unstoppable five-second
 * carousel is hostile to anyone reading slowly, and the slide artwork is the
 * copy here, so there is real text to miss.
 *
 * Off-screen slides are `inert`, which takes their links out of the tab order
 * and hides them from assistive tech in one attribute — without it, a keyboard
 * visitor tabs into three invisible links before reaching the nav.
 */
export function HeroCarousel({ slides, labels }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);

    // Advancing in a background tab is wasted work, and it leaves the visitor on
    // an arbitrary slide when they come back.
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) {
        timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* The rail takes its height from the artwork's aspect ratio, so nothing
          shifts when the image decodes. Portrait below 769px and landscape above
          it — the two ratios the art was actually cut for. */}
      <div className="relative aspect-[1333/1833] w-full imp:aspect-[2490/945]">
        {slides.map((slide, i) => (
          <div
            key={i}
            inert={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Dots sit below the portrait art on a phone and overlay the landscape art
          on desktop. The mobile frames put their own "Shop now" bottom-centre,
          which is exactly where an overlaid dot row lands. */}
      {slides.length > 1 ? (
        <div className="flex justify-center gap-1 py-1 imp:absolute imp:bottom-6 imp:left-1/2 imp:z-[2] imp:-translate-x-1/2 imp:py-0">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              // 36px of tappable area around an 8px dot.
              className="grid h-9 w-9 place-items-center"
            >
              <span
                className={`block h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/45"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Announces the change without moving focus. */}
      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {slides.length}: {labels[index]}
      </p>
    </section>
  );
}
