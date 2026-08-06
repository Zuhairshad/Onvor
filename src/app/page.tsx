import { AnnouncementBar } from "@/components/theme/AnnouncementBar";
import { FeaturedCollection } from "@/components/theme/FeaturedCollection";
import { CategoryGrid } from "@/components/theme/CategoryGrid";
import { FeaturedCollections } from "@/components/theme/FeaturedCollections";
import { Footer } from "@/components/theme/Footer";
import { Header } from "@/components/theme/Header";
import { HeroBanner } from "@/components/theme/HeroBanner";
import { HeroVideo } from "@/components/theme/HeroVideo";
import { PromoGrid } from "@/components/theme/PromoGrid";
import { SlideshowHero } from "@/components/theme/SlideshowHero";
import { TextAndImage } from "@/components/theme/TextAndImage";
import { TextWithIcons } from "@/components/theme/TextWithIcons";
import { Toolbar } from "@/components/theme/Toolbar";
import { SECTION_HEADINGS } from "@/lib/content/onvor";

/**
 * Onvor's best sellers, in the order their live store features them. These stay
 * inline until the Storefront API is wired; then they come from
 * `getCollection("frontpage")` and prices become live.
 */
const BEST_SELLING = [
  {
    handle: "signature-straight-fit-black",
    title: "Signature Straight Fit - Black",
    price: "2379.30",
    image: "/onvor/products/signature-straight-fit-black-1.jpg",
    hoverImage: "/onvor/products/signature-straight-fit-black-2.jpg",
  },
  {
    handle: "urdu-calligraphy-tee-white",
    title: "Urdu Calligraphy Tee - White",
    price: "1679.30",
    image: "/onvor/products/urdu-calligraphy-tee-white-1.jpg",
    hoverImage: "/onvor/products/urdu-calligraphy-tee-white-2.jpg",
  },
  {
    handle: "stamp-shorts-grey",
    title: "Stamp Shorts - Grey",
    price: "1959.30",
    image: "/onvor/products/stamp-shorts-grey-1.jpg",
    hoverImage: "/onvor/products/stamp-shorts-grey-2.jpg",
  },
  {
    handle: "signature-tee-steel-grey",
    title: "Signature Tee - Steel Grey",
    price: "1679.30",
    image: "/onvor/products/signature-tee-steel-grey-1.jpg",
    hoverImage: "/onvor/products/signature-tee-steel-grey-2.jpg",
  },
  {
    handle: "stamp-rainbow-tee",
    title: "Stamp Rainbow Tee",
    price: "1679.30",
    image: "/onvor/products/stamp-rainbow-tee-1.jpg",
    hoverImage: "/onvor/products/stamp-rainbow-tee-2.jpg",
  },
];

const NEW_ARRIVALS = [
  {
    handle: "refined-loose-fit-tee-black",
    title: "Refined Loose Fit Tee - Black",
    price: "1749.30",
    image: "/onvor/products/refined-loose-fit-tee-black-1.jpg",
    hoverImage: "/onvor/products/refined-loose-fit-tee-black-2.jpg",
  },
  {
    handle: "stamp-tee-white",
    title: "Stamp Tee - White",
    price: "1679.30",
    image: "/onvor/products/stamp-tee-white-1.jpg",
    hoverImage: "/onvor/products/stamp-tee-white-2.jpg",
  },
  {
    handle: "urdu-calligraphy-tee-charcoal",
    title: "Urdu Calligraphy Tee - Charcoal",
    price: "1679.30",
    image: "/onvor/products/urdu-calligraphy-tee-charcoal-1.jpg",
    hoverImage: "/onvor/products/urdu-calligraphy-tee-charcoal-2.jpg",
  },
  {
    handle: "signature-shorts-black",
    title: "Signature Shorts - Black",
    price: "1959.30",
    image: "/onvor/products/signature-shorts-black-1.jpg",
    hoverImage: "/onvor/products/signature-shorts-black-2.jpg",
  },
  {
    handle: "signature-shorts-charcoal",
    title: "Signature Shorts - Charcoal",
    price: "1959.30",
    image: "/onvor/products/signature-shorts-charcoal-1.jpg",
    hoverImage: "/onvor/products/signature-shorts-charcoal-2.jpg",
  },
];

/**
 * Homepage. Section order follows the reference theme's homepage: hero, collection
 * tiles, a product row, promo panels, a second product row, promo hero, brand
 * story, image hero, category grid, value props, footer.
 *
 * The hero itself is Onvor's own banner rail rather than the reference's
 * shoppable frame — their campaign art has the headline and CTA burnt into it,
 * so there is nothing to overlay and nowhere clean to hang a hotspot.
 *
 * That also rules out the reference's transparent header: the artwork carries an
 * ONVOR wordmark of its own near the top, and an overlaid header puts ours right
 * on it. Their live store keeps the header solid above the banner too.
 */
export default function Home() {
  return (
    <>
      <AnnouncementBar />

      <Toolbar />
      <Header />
      <HeroBanner />

      <main id="MainContent" className="flex-1">
        <FeaturedCollections />
        <FeaturedCollection
          heading={SECTION_HEADINGS.bestSelling}
          products={BEST_SELLING}
          viewAllHref="/collections/all-products"
        />
        <PromoGrid />
        <FeaturedCollection
          heading={SECTION_HEADINGS.newArrivals}
          products={NEW_ARRIVALS}
          viewAllHref="/collections/all-products"
        />
        <HeroVideo />
        <TextAndImage />
        <SlideshowHero />
        <CategoryGrid />
        <TextWithIcons />
      </main>

      <Footer />
    </>
  );
}
