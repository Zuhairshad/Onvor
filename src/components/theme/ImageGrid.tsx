import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Reveal } from "@/components/theme/Reveal";

export type ImageGridTile = {
  /** Omit to render the image with no caption, as the lookbook does. */
  label?: string;
  href?: string;
  src: string;
  width: number;
  height: number;
  alt?: string;
};

type Props = {
  tiles: ImageGridTile[];
  /** --image-grid-columns. Extra tiles wrap and stretch to fill the last row. */
  columns?: 2 | 3 | 4 | 5;
  /** --image-grid-gap, in px. */
  gap?: number;
  aspect?: "landscape" | "portrait" | "square";
  /** --image-grid-overlay-opacity. 0 disables the scrim entirely. */
  overlayOpacity?: number;
  /** The homepage grid sits in the container; the lookbook runs edge to edge. */
  fullBleed?: boolean;
  divider?: boolean;
};

const ASPECT = {
  landscape: "aspect-[4/3]",
  portrait: "aspect-[2/3]",
  square: "aspect-square",
} as const;

/**
 * The theme's `image_grid` section. The reference reuses it for the homepage
 * category tiles and, twice over, for the lookbook - so this takes the same knobs
 * its section settings do rather than being two near-identical components.
 *
 * The layout trick is worth preserving: tiles are flex items with a
 * `100%/columns` basis and `flex-grow: 1`, so a five-tile grid at three columns
 * lands three on the first row and lets the remaining two stretch to fill the
 * second. That is how both the homepage's 4-then-2 and the lookbook's 3-then-2
 * arrangements fall out of one rule.
 */
export function ImageGrid({
  tiles,
  columns = 4,
  gap = 30,
  aspect = "landscape",
  overlayOpacity = 0.3,
  fullBleed = false,
  divider = false,
}: Props) {
  const showOverlay = overlayOpacity > 0;

  return (
    <section className={[divider ? "section--divider" : "", "index-section"].join(" ")}>
      <div className={fullBleed ? "" : "page-width"}>
        <ul
          className="m-0 flex list-none flex-wrap p-0"
          style={
            {
              gap: `${gap}px`,
              "--grid-gap": `${gap}px`,
              "--grid-cols": columns,
            } as CSSProperties
          }
        >
          {tiles.map((tile, i) => {
            const media = (
              <span
                className={`relative block w-full overflow-hidden ${ASPECT[aspect]}`}
              >
                <Image
                  src={tile.src}
                  alt={tile.alt ?? ""}
                  width={tile.width}
                  height={tile.height}
                  sizes={`(min-width: 769px) ${Math.round(100 / columns)}vw, 50vw`}
                  className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
                />
                {showOverlay ? (
                  <span
                    className="absolute inset-0 bg-black transition-opacity"
                    style={{ opacity: overlayOpacity }}
                    aria-hidden
                  />
                ) : null}
                {tile.label ? (
                  <span className="absolute inset-x-[10px] top-1/2 z-[1] -translate-y-1/2 text-center break-words text-white">
                    {tile.label}
                  </span>
                ) : null}
              </span>
            );

            return (
              <Reveal
                key={tile.src + i}
                as="li"
                delay={(Math.min(i, 3) + 1) as 1 | 2 | 3 | 4}
                className="image-grid-item group"
              >
                {tile.href ? (
                  <Link href={tile.href} className="block">
                    {media}
                  </Link>
                ) : (
                  media
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
