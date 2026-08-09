"use client";

import { useEffect, useState } from "react";

type Slide = {
  lines: readonly string[];
  size: "xl" | "lg" | "md";
  footnote?: string;
};

const SLIDES: readonly Slide[] = [
  { lines: ["Azadi", "Sale"], size: "xl" },
  { lines: ["Flat 30%", "Off"], size: "xl" },
] as const;

const SLIDE_MS = 2400;
const FADE_MS = 500;

const SIZE_CLASS: Record<Slide["size"], string> = {
  xl: "text-[54px] leading-[0.95] imp:text-[132px]",
  lg: "text-[42px] leading-[1.0] imp:text-[104px]",
  md: "text-[32px] leading-[1.05] imp:text-[80px]",
};

export function AzadiSaleTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-white"
      aria-live="polite"
      aria-atomic
    >
      <div className="relative w-full px-6">
        {SLIDES.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              aria-hidden={!active}
              className="absolute inset-0 flex flex-col items-center justify-center transition-opacity ease-out"
              style={{
                opacity: active ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
              }}
            >
              <p
                className={`font-heading font-semibold tracking-[-0.01em] uppercase ${SIZE_CLASS[slide.size]}`}
              >
                {slide.lines.map((line, li) => (
                  <span key={li} className="block">
                    {line}
                  </span>
                ))}
              </p>
              {slide.footnote && (
                <p className="mt-6 text-[11px] font-bold tracking-[0.18em] uppercase opacity-90 imp:mt-10 imp:text-[13px]">
                  {slide.footnote}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
