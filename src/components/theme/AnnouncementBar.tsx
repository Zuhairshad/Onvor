"use client";

import { useEffect, useState } from "react";

/**
 * Rotating announcement bar. Both messages are stacked absolutely inside a
 * fixed-height box so swapping them cannot shift the page.
 */
const MESSAGES = [
  { bold: "Free shipping", rest: "On all orders over $100" },
  { bold: "Hassle-free returns", rest: "30-day postage paid returns" },
] as const;

const INTERVAL_MS = 5000;

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    // Reduced motion holds the first message: the timer simply never starts, so
    // there is no state to track for it.
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;

    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };

    const start = () => {
      if (query.matches) return;
      timer = window.setInterval(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
      }, INTERVAL_MS);
    };

    const onPreferenceChange = () => {
      stop();
      start();
    };

    start();
    query.addEventListener("change", onPreferenceChange);

    return () => {
      stop();
      query.removeEventListener("change", onPreferenceChange);
    };
  }, [paused]);

  return (
    <div
      className="bg-announcement text-ink relative text-[12px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="page-width">
        {/* Both messages share one grid cell, so the box is as tall as the taller
            of them and swapping cannot shift the page — no fixed height needed
            (a fixed height would fight the 10px padding under border-box). */}
        <div className="grid py-[10px] text-center">
          {MESSAGES.map((message, i) => (
            <p
              key={message.bold}
              aria-hidden={i !== index}
              className={[
                "col-start-1 row-start-1 transition-opacity duration-500",
                i === index ? "opacity-100" : "pointer-events-none opacity-0",
              ].join(" ")}
            >
              <span className="tracking-caps text-[0.9em] font-bold uppercase">
                {message.bold}
              </span>{" "}
              <span>{message.rest}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
