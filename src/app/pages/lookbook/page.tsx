import type { Metadata } from "next";

import { AnnouncementBar } from "@/components/theme/AnnouncementBar";
import { Footer } from "@/components/theme/Footer";
import { Header } from "@/components/theme/Header";
import { ImageGrid, type ImageGridTile } from "@/components/theme/ImageGrid";
import { Reveal } from "@/components/theme/Reveal";

export const metadata: Metadata = {
  title: "The Lookbook",
  description:
    "Onvor's campaign photography - unisex cotton basics shot in neon, cut for an easy fit.",
};

/**
 * The reference lookbook is a rich-text header followed by two `image_grid`
 * sections, both full-bleed, three columns, 2:3 portrait, 40px gaps and no
 * overlay or captions. Five images per grid means each lays out three across then
 * lets the remaining two stretch to fill the second row.
 *
 * Onvor has six editorial frames. They are split across the two grids with
 * product shots filling the rest, since the reference's ten-image lookbook is
 * more photography than their campaign produced.
 */
const EDITORIAL = "Onvor campaign photography";

const FIRST_GRID: ImageGridTile[] = [
  { src: "/onvor/lifestyle-1.jpg", width: 1000, height: 1500, alt: EDITORIAL },
  { src: "/onvor/lifestyle-2.jpg", width: 1000, height: 1500, alt: EDITORIAL },
  { src: "/onvor/lifestyle-3.jpg", width: 1000, height: 1500, alt: EDITORIAL },
  { src: "/onvor/lifestyle-4.jpg", width: 1000, height: 1500, alt: EDITORIAL },
  { src: "/onvor/lifestyle-5.jpg", width: 1000, height: 1500, alt: EDITORIAL },
];

const SECOND_GRID: ImageGridTile[] = [
  { src: "/onvor/lifestyle-6.jpg", width: 1000, height: 1500, alt: EDITORIAL },
  {
    src: "/onvor/products/stamp-rainbow-tee-1.jpg",
    width: 1000,
    height: 1500,
    alt: "Stamp Rainbow Tee",
    href: "/products/stamp-rainbow-tee",
  },
  {
    src: "/onvor/products/signature-straight-fit-black-1.jpg",
    width: 1000,
    height: 1500,
    alt: "Signature Straight Fit in black",
    href: "/products/signature-straight-fit-black",
  },
  {
    src: "/onvor/products/urdu-calligraphy-tee-charcoal-1.jpg",
    width: 1000,
    height: 1500,
    alt: "Urdu Calligraphy Tee in charcoal",
    href: "/products/urdu-calligraphy-tee-charcoal",
  },
  {
    src: "/onvor/products/stamp-shorts-grey-1.jpg",
    width: 1000,
    height: 1500,
    alt: "Stamp Shorts in grey",
    href: "/products/stamp-shorts-grey",
  },
];

export default function LookbookPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main id="MainContent" className="flex-1">
        {/* rich_text: centred title and standfirst */}
        <section className="index-section">
          <div className="page-width">
            <Reveal className="mx-auto max-w-[52rem] text-center">
              <h1>The Lookbook</h1>
              <p className="mt-4 text-[18px] imp:text-[21px]">
                Cotton basics shot in neon. Loose-fit tees, relaxed trousers and easy
                shorts - the same pieces, worn however you like.
              </p>
            </Reveal>
          </div>
        </section>

        <ImageGrid
          tiles={FIRST_GRID}
          columns={3}
          gap={40}
          aspect="portrait"
          overlayOpacity={0}
          fullBleed
        />

        <ImageGrid
          tiles={SECOND_GRID}
          columns={3}
          gap={40}
          aspect="portrait"
          overlayOpacity={0}
          fullBleed
        />
      </main>

      <Footer />
    </>
  );
}
