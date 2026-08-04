"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger step; each unit adds 120ms so siblings cascade rather than pop together. */
  delay?: 0 | 1 | 2 | 3 | 4;
  className?: string;
  /** Rendered element. Sections pass "section"; grid items pass "li". */
  as?: "div" | "section" | "li";
};

const STEP_MS = 120;

/**
 * Fades and lifts its children into view the first time they scroll into range,
 * then stops observing — it never re-hides or re-animates.
 *
 * The reveal state lives in a `data-reveal` attribute written straight to the
 * node rather than in React state: this effect's whole job is to drive the DOM
 * from an IntersectionObserver, and keeping it out of state avoids a cascading
 * re-render per section on mount.
 *
 * Because the server renders no `data-reveal` attribute, content is visible in
 * the initial HTML and stays visible if JS never runs. The stylesheet drops the
 * opacity/transform rules entirely under `prefers-reduced-motion: reduce`.
 */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Anything already on screen at mount reveals immediately, so above-the-fold
    // sections never flash hidden.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) {
      node.setAttribute("data-reveal", "visible");
      return;
    }

    node.setAttribute("data-reveal", "pending");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "visible");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      // Callback ref keeps this polymorphic without casting through `any`.
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay * STEP_MS}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
