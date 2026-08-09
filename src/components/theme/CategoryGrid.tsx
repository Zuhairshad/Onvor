import { ImageGrid, type ImageGridTile } from "@/components/theme/ImageGrid";

/**
 * The homepage's category tiles: the two gender categories the live store leads
 * with, then four fit-based collections to fill the grid. Their collections carry
 * no collection images, so the tiles borrow representative product shots.
 */
const TILES: ImageGridTile[] = [
  {
    label: "Men",
    href: "/collections/men",
    src: "/onvor/products/refined-loose-fit-tee-black-1.jpg",
    width: 1000,
    height: 1500,
  },
  {
    label: "Women",
    href: "/collections/women",
    src: "/onvor/products/category-women-studio.jpg",
    width: 1024,
    height: 1536,
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

export function CategoryGrid() {
  return <ImageGrid tiles={TILES} columns={4} gap={30} aspect="landscape" divider />;
}
