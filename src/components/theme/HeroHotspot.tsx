"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { IconChevronRight, IconPlus } from "@/components/theme/icons";
import { formatPkr } from "@/lib/money";

export type Hotspot = {
  handle: string;
  title: string;
  price: string;
  /** Percent offsets within the media box. */
  top: number;
  left: number;
  topMobile: number;
  leftMobile: number;
};

/** A `+` marker pinned to a garment, opening a small product card. */
export function HeroHotspot({ spot }: { spot: Hotspot }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="hotspot z-[4]"
      style={
        {
          "--hotspot-top": `${spot.top}%`,
          "--hotspot-left": `${spot.left}%`,
          "--hotspot-top-mobile": `${spot.topMobile}%`,
          "--hotspot-left-mobile": `${spot.leftMobile}%`,
        } as CSSProperties
      }
    >
      <button
        type="button"
        aria-label={spot.title}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="bg-announcement flex h-9 w-9 items-center justify-center rounded-full text-black shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform hover:scale-110"
      >
        <IconPlus className="h-3 w-3" />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+8px)] left-1/2 w-[210px] -translate-x-1/2 bg-white text-left shadow-[0_6px_24px_rgba(0,0,0,0.18)]">
          <div className="px-4 pt-3 pb-2">
            <p className="text-ink m-0 text-[15px]">{spot.title}</p>
            <div className="text-ink mt-1 text-[15px]">{formatPkr(spot.price)}</div>
          </div>
          <div className="border-hairline border-t">
            <Link
              href={`/products/${spot.handle}`}
              className="text-ink tracking-caps flex items-center gap-1 px-4 py-3 text-[12px] uppercase"
            >
              View product
              <IconChevronRight className="h-[10px] w-[6px]" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
