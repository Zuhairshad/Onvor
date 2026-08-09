import { Suspense } from "react";

import { AnnouncementBar } from "@/components/theme/AnnouncementBar";
import { FeaturedCollection } from "@/components/theme/FeaturedCollection";
import { CategoryGrid } from "@/components/theme/CategoryGrid";
import { CommunityVideos } from "@/components/theme/CommunityVideos";
import { CustomerReviews } from "@/components/theme/CustomerReviews";
import { FeaturedCollections } from "@/components/theme/FeaturedCollections";
import { Footer } from "@/components/theme/Footer";
import { Header } from "@/components/theme/Header";
import { HeroVideo } from "@/components/theme/HeroVideo";
import { ShoppableHero } from "@/components/theme/ShoppableHero";
import { SlideshowHero } from "@/components/theme/SlideshowHero";
import { TextAndImage } from "@/components/theme/TextAndImage";
import { Toolbar } from "@/components/theme/Toolbar";
import { SECTION_HEADINGS } from "@/lib/content/onvor";
import { getProducts } from "@/lib/shopify";
import { toFeaturedProduct } from "@/lib/shopify/adapters";

function FeaturedRowSkeleton() {
  return (
    <section className="index-section">
      <div className="page-width">
        <div className="bg-body-dim mb-6 h-[32px] w-[220px] imp:mb-8" />
        <ul className="m-0 flex list-none flex-wrap p-0" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="w-1/2 px-[8.5px] pb-[25px] imp:w-1/5">
              <div className="bg-body-dim aspect-[2/3] w-full" />
              <div className="bg-body-dim mt-3 h-[22px] w-3/4" />
              <div className="bg-body-dim mt-1 h-[21px] w-1/3" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function BestSellingRow() {
  const { items } = await getProducts({ first: 5, sortKey: "BEST_SELLING" });
  return (
    <FeaturedCollection
      heading={SECTION_HEADINGS.bestSelling}
      products={items.map(toFeaturedProduct)}
      viewAllHref="/collections/all-products"
    />
  );
}

async function NewArrivalsRow() {
  const { items } = await getProducts({ first: 5, sortKey: "CREATED_AT", reverse: true });
  return (
    <FeaturedCollection
      heading={SECTION_HEADINGS.newArrivals}
      products={items.map(toFeaturedProduct)}
      viewAllHref="/collections/all-products"
    />
  );
}

/**
 * Homepage. Section order follows the reference theme's homepage: shoppable hero,
 * collection tiles, a product row, promo panels, a second product row, promo hero,
 * brand story, image hero, category grid, value props, footer.
 *
 * The toolbar and header ride over the shoppable hero, so both sit inside the
 * hero's positioning context rather than in normal flow above it.
 */
export default function Home() {
  return (
    <>
      <AnnouncementBar />

      <div className="relative">
        <Toolbar />
        <Header overlay />
        <ShoppableHero />
      </div>

      <main id="MainContent" className="flex-1">
        <FeaturedCollections />
        <Suspense fallback={<FeaturedRowSkeleton />}>
          <BestSellingRow />
        </Suspense>
        <CommunityVideos />
        <Suspense fallback={<FeaturedRowSkeleton />}>
          <NewArrivalsRow />
        </Suspense>
        <HeroVideo />
        <TextAndImage />
        <SlideshowHero />
        <CategoryGrid />
        <CustomerReviews />
      </main>

      <Footer />
    </>
  );
}
