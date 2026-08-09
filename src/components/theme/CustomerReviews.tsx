"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { REVIEWS } from "@/lib/content/onvor";

/**
 * Horizontally-scrolling testimonial strip that sits above the footer.
 *
 * The layout matches the reference (heading left, arrows right, snap-scroll
 * row of cards), but everything inside is our brand - Host Grotesk headings,
 * Fustat body, ink text on the beige body colour, hairline dividers between
 * cards. Mobile is a single-card swipe; from `imp` the row peeks at the next
 * card so the horizontal affordance is obvious without cropping copy.
 */

function StarRow() {
  return (
    <div className="mb-3 flex gap-[3px]" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          aria-hidden
          viewBox="0 0 20 20"
          className="h-[14px] w-[14px] fill-current text-ink"
        >
          <path d="M10 1.5 12.7 7l6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6L1.3 7.9l6-.9L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

function Arrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous reviews" : "Next reviews"}
      className="border-hairline text-ink hover:border-ink flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:hover:border-current"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${dir === "prev" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export function CustomerReviews() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= maxScroll - 2);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // One card at a time on desktop feels sluggish, three feels too far;
    // scrolling by 80% of the visible width lands mid-card and lets snap
    // finish the job.
    const distance = el.clientWidth * 0.8 * dir;
    el.scrollBy({ left: distance, behavior: "smooth" });
  }, []);

  return (
    <section className="section--divider index-section">
      <div className="page-width">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="m-0">Customer Reviews</h2>
          <div className="hidden gap-3 imp:flex">
            <Arrow dir="prev" onClick={() => scrollByCard(-1)} disabled={atStart} />
            <Arrow dir="next" onClick={() => scrollByCard(1)} disabled={atEnd} />
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-[17px] flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-[17px] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden imp:mx-0 imp:gap-8 imp:px-0"
        >
          {REVIEWS.map((review) => (
            <article
              key={review.name}
              className="border-hairline flex w-[85%] shrink-0 snap-start flex-col border-l pl-6 first:border-l-0 first:pl-0 imp:w-[calc((100%-4*2rem)/5)]"
            >
              <StarRow />
              <p className="mb-6 flex-1 text-[14px] leading-[1.65] opacity-80">
                {review.body}
              </p>
              <p className="tracking-caps m-0 text-[12px] uppercase">{review.name}</p>
              <p className="tracking-caps m-0 mt-1 text-[11px] uppercase opacity-55">
                {review.meta}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
