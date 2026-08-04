import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

type Tile = {
  label: string;
  href: string;
  src: string;
  width: number;
  height: number;
};

const TILES: Tile[] = [
  {
    label: "Men",
    href: "/collections/men",
    src: "/onvor/tile-men.jpg",
    width: 1400,
    height: 548,
  },
  {
    label: "Women",
    href: "/collections/women",
    src: "/onvor/tile-women.jpg",
    width: 1400,
    height: 548,
  },
  {
    label: "Loose Fit Tees",
    href: "/collections/oversized-tees",
    src: "/onvor/products/stamp-tee-white-1.jpg",
    width: 1000,
    height: 1500,
  },
  {
    label: "Bottoms",
    href: "/collections/bottoms",
    src: "/onvor/products/signature-straight-fit-black-1.jpg",
    width: 1000,
    height: 1500,
  },
  {
    label: "Shorts",
    href: "/collections/shorts",
    src: "/onvor/products/signature-shorts-charcoal-1.jpg",
    width: 1000,
    height: 1500,
  },
  {
    label: "Pleated Trousers",
    href: "/collections/pleated-trousers",
    src: "/onvor/products/signature-straight-fit-black-2.jpg",
    width: 1000,
    height: 1500,
  },
];

/**
 * Onvor's collection tiles: the two gender categories the live store leads with,
 * then four fit-based collections to fill the grid. Their collections carry no
 * collection images, so the fit tiles borrow representative product shots.
 *
 * Six flex items, each with `flex-grow: 1` and a quarter-width basis. Four land
 * on the first row and the remaining two stretch to fill the second — that is
 * how the reference gets its 4-then-2 layout, so the second row is not
 * special-cased.
 */
export function ImageGrid() {
  return (
    <section className="section--divider index-section">
      <div className="page-width">
        <ul className="m-0 flex list-none flex-wrap gap-[30px] p-0">
          {TILES.map((tile, i) => (
            <Reveal
              key={tile.label}
              as="li"
              delay={(Math.min(i, 3) + 1) as 1 | 2 | 3 | 4}
              className="group basis-[calc(50%-30px)] imp:basis-[calc(25%-30px)] grow"
            >
              <Link href={tile.href} className="block">
                <span className="relative block aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={tile.src}
                    alt=""
                    width={tile.width}
                    height={tile.height}
                    sizes="(min-width: 769px) 25vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
                  />
                  {/* image-grid overlay: #000 at 0.3, +0.1 on hover */}
                  <span
                    className="absolute inset-0 bg-black opacity-30 transition-opacity group-hover:opacity-40"
                    aria-hidden
                  />
                  <span className="absolute inset-x-[10px] top-1/2 z-[1] -translate-y-1/2 text-center break-words text-white">
                    {tile.label}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
