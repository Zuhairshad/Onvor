"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

/**
 * Three-tile stacked image reveal.
 *
 * Ported from the shadcn `image-tiles` snippet and adapted to Onvor: three
 * square tiles fan out on enter, each tile nudges independently on hover. The
 * container fills its parent's width and keeps the same square aspect on every
 * viewport so the fan-out geometry stays consistent.
 */
type Props = {
  leftImage: string;
  middleImage: string;
  rightImage: string;
  /** Accessible alt text; the middle image is what actually announces. */
  alt?: string;
};

const container: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { delay: 0.2, staggerChildren: 0.2 },
  },
};

/* Offsets are percentages of each tile's own width, so the fan-out scales with
   the container. Three tiles at w-[42%] with ±85% x-shifts land at roughly the
   left third / centre / right third of the container with a comfortable
   overlap - the geometry from the reference screenshot. */
const left: Variants = {
  initial: { rotate: 0, x: "0%", y: 0 },
  animate: {
    rotate: -8,
    x: "-80%",
    y: 10,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
  hover: {
    rotate: -4,
    x: "-85%",
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

/* Two-tile mobile arrangement: the left tile fans a shorter distance because
   there is no third tile to balance it - keeping the same -80% shift as desktop
   would leave the middle tile stranded on the right of the frame. */
const leftMobile: Variants = {
  initial: { rotate: 0, x: "0%", y: 0 },
  animate: {
    rotate: -6,
    x: "-55%",
    y: 6,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
  hover: {
    rotate: -3,
    x: "-58%",
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

const middleMobile: Variants = {
  initial: { rotate: 0, x: "0%", y: 0 },
  animate: {
    rotate: 4,
    x: "25%",
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
  hover: {
    rotate: 0,
    x: "25%",
    y: -8,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

const middle: Variants = {
  initial: { rotate: 0, x: 0, y: 0 },
  animate: {
    rotate: 4,
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
  hover: {
    rotate: 0,
    x: 0,
    y: -10,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

const right: Variants = {
  initial: { rotate: 0, x: "0%", y: 0 },
  animate: {
    rotate: -6,
    x: "80%",
    y: 18,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
  hover: {
    rotate: -2,
    x: "85%",
    y: 8,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

type TileProps = {
  src: string;
  alt: string;
  variants: Variants;
  origin: string;
  z: number;
  priority?: boolean;
  className?: string;
};

/* Delay the fan-out until the section actually scrolls into view. `once: true`
   means it plays exactly once per visit; `amount: 0.35` waits until roughly a
   third of the stack is on screen so the movement reads properly on phones. */
const IN_VIEW = { once: true, amount: 0.35 } as const;

function Tile({ src, alt, variants, origin, z, priority, className = "" }: TileProps) {
  return (
    <motion.div
      className={`absolute aspect-square w-[48%] overflow-hidden rounded-2xl shadow-[0_18px_40px_-14px_rgba(0,0,0,0.35)] ${origin} ${className}`}
      variants={variants}
      /* Each tile owns its own whileInView because a parent-level animate prop
         does not reliably propagate to children that also set whileHover /
         whileTap. `whileTap` reuses the hover variant so a mobile tap produces
         the same nudge as a desktop pointer hover. */
      initial="initial"
      whileInView="animate"
      viewport={IN_VIEW}
      whileHover="hover"
      whileTap="hover"
      style={{ zIndex: z }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 320px, (min-width: 769px) 28vw, 46vw"
        className="object-cover"
        priority={priority}
      />
    </motion.div>
  );
}

/**
 * The container reserves the width the fan-out needs: three tiles at w-[42%]
 * spread ±90% of a tile from centre lands the outer tiles at about ±38% of the
 * container width, so a 500px container gives ~200px tiles with ~190px of
 * horizontal breathing room on each side. Aspect ratio stays generous so the
 * rotated corners aren't clipped.
 */
export function ImageReveal({ leftImage, middleImage, rightImage, alt = "" }: Props) {
  return (
    <>
      {/* Mobile: two tiles only. A third tile at this width would clip against
          the copy above and eat the tap targets on the button row. */}
      <div className="relative mx-auto flex aspect-[4/3] w-full max-w-[720px] items-center justify-center imp:hidden">
        <Tile src={leftImage} alt="" variants={leftMobile} origin="origin-bottom-right" z={20} />
        <Tile
          src={middleImage}
          alt={alt}
          variants={middleMobile}
          origin="origin-bottom"
          z={10}
          priority
        />
      </div>

      {/* Desktop: full three-tile fan-out. */}
      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[720px] items-center justify-center imp:flex">
        <Tile src={leftImage} alt="" variants={left} origin="origin-bottom-right" z={30} />
        <Tile src={middleImage} alt={alt} variants={middle} origin="origin-bottom" z={20} priority />
        <Tile src={rightImage} alt="" variants={right} origin="origin-bottom-left" z={10} />
      </div>
    </>
  );
}
