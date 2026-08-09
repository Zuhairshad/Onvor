import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";

/**
 * Four portrait collection tiles, two-up on mobile and four-up from 769px.
 * The title sits *below* the image, bottom-left, in the body face - the reference
 * uses `collection-item__title--below` here rather than overlaying it like the
 * lower image grid does.
 *
 * Onvor's collections carry no collection images, so each tile borrows a
 * representative product shot (all 1000x1500, the 2:3 the layout wants).
 */
const TILES = [
  {
    title: "Loose Fit Tees",
    href: "/collections/oversized-tees",
    src: "/onvor/products/stamp-rainbow-tee-1.jpg",
  },
  {
    title: "Baggy Trouser",
    href: "/collections/baggy-trouser",
    src: "/onvor/products/signature-straight-fit-black-1.jpg",
  },
  {
    title: "Shorts",
    href: "/collections/shorts",
    src: "/onvor/products/stamp-shorts-grey-1.jpg",
  },
  {
    title: "Straight Fit Trouser",
    href: "/collections/straight-fit-trouser",
    src: "/onvor/products/signature-straight-fit-black-2.jpg",
  },
] as const;

export function FeaturedCollections() {
  return (
    <section className="index-section">
      <div className="page-width">
        <ul className="m-0 flex list-none flex-wrap p-0">
          {TILES.map((tile, i) => (
            <Reveal
              key={tile.title}
              as="li"
              delay={(i + 1) as 1 | 2 | 3 | 4}
              className="w-1/2 px-[8.5px] pb-[17px] imp:w-1/4"
            >
              <Link href={tile.href} className="group block">
                <span className="relative block aspect-[2/3] w-full overflow-hidden">
                  <Image
                    src={tile.src}
                    alt=""
                    width={1000}
                    height={1500}
                    sizes="(min-width: 769px) 25vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
                  />
                </span>
                <span className="text-ink mt-3 block text-left">{tile.title}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
