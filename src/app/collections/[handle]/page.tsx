import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AnnouncementBar } from "@/components/theme/AnnouncementBar";
import { CollectionToolbar } from "@/components/theme/CollectionToolbar";
import { Footer } from "@/components/theme/Footer";
import { Header } from "@/components/theme/Header";
import { ProductCard } from "@/components/theme/ProductCard";
import { Reveal } from "@/components/theme/Reveal";
import {
  COLLECTION_PRODUCTS,
  productsInCollection,
  type CatalogProduct,
} from "@/lib/content/catalog";
import {
  applyFilters,
  countActive,
  facetsFor,
  parseFilters,
} from "@/lib/content/filters";
import { ANNOUNCEMENTS, COLLECTIONS } from "@/lib/content/onvor";
import { isSortValue, type SortValue } from "@/lib/content/sort";

/**
 * Every collection the store has, whether or not the snapshot caught products
 * for it. `pleated-trousers` is the case in point: it is in the nav and in two
 * mega menus, the store has two products in it, and the snapshot has none — so
 * gating the route on the snapshot 404'd a link that sits on every page.
 */
const KNOWN = new Set([
  ...Object.keys(COLLECTION_PRODUCTS),
  ...COLLECTIONS.map((collection) => collection.handle),
]);

/** Titles and standfirsts for the collections that have products. */
const META: Record<string, { title: string; description?: string }> = {
  men: { title: "Men", description: "Loose-fit tees and relaxed trousers in 100% cotton." },
  women: { title: "Women", description: "The same cotton basics, cut to the same easy fit." },
  "all-products": { title: "All Products" },
  "oversized-tees": {
    title: "Loose Fit Tees",
    description: "Cut a size easy and built to keep their shape.",
  },
  "oversized-tees-men": { title: "Loose Fit Tees — Men" },
  "oversized-tees-women": { title: "Loose Fit Tees — Women" },
  "t-shirt": { title: "Tops" },
  bottoms: { title: "Bottoms", description: "Baggy, straight and pleated fits that move with you." },
  "baggy-trouser": { title: "Baggy Trouser" },
  "straight-fit-trouser": { title: "Straight Fit Trouser" },
  shorts: { title: "Shorts" },
  "trousers-women": { title: "Trousers — Women" },
};

function sortProducts(products: CatalogProduct[], sort: SortValue): CatalogProduct[] {
  const items = [...products];
  switch (sort) {
    case "title-asc":
      return items.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return items.sort((a, b) => b.title.localeCompare(a.title));
    case "price-asc":
      return items.sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc":
      return items.sort((a, b) => Number(b.price) - Number(a.price));
    case "best-selling":
      // No sales data in the snapshot; the store's own order is the closest proxy.
      return items;
    default:
      return items;
  }
}

/** Prerender every collection that has products. */
export function generateStaticParams() {
  return Object.keys(COLLECTION_PRODUCTS)
    .filter((handle) => COLLECTION_PRODUCTS[handle].length > 0)
    .map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const meta = META[handle];
  const known = COLLECTIONS.find((c) => c.handle === handle);
  const title = meta?.title ?? known?.title ?? handle;
  return { title, description: meta?.description };
}

/** Same geometry as the real grid, so streaming it in shifts nothing. */
function GridSkeleton({ count }: { count: number }) {
  return (
    <>
      <div className="border-hairline flex flex-wrap items-center justify-between gap-3 border-b py-4">
        <div className="bg-body-dim rounded-btn h-[38px] w-[104px]" />
        <div className="bg-body-dim hidden h-[21px] w-[84px] imp:block" />
        <div className="bg-body-dim rounded-btn h-[38px] w-[150px]" />
      </div>
      <ul className="m-0 mt-8 flex list-none flex-wrap p-0" aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="w-1/2 px-[8.5px] pb-[30px] imp:w-1/4">
            <div className="bg-body-dim aspect-[2/3] w-full" />
            <div className="bg-body-dim mt-3 h-[22px] w-3/4" />
            <div className="bg-body-dim mt-1 h-[21px] w-1/3" />
          </li>
        ))}
      </ul>
    </>
  );
}

async function Grid({
  handle,
  searchParams,
}: {
  handle: string;
  searchParams: PageProps<"/collections/[handle]">["searchParams"];
}) {
  const resolved = await searchParams;
  const raw = typeof resolved.sort === "string" ? resolved.sort : "featured";
  const sort: SortValue = isSortValue(raw) ? raw : "featured";

  const all = productsInCollection(handle);
  const facets = facetsFor(all);
  const filters = parseFilters(resolved, facets);
  const products = sortProducts(applyFilters(all, filters), sort);

  return (
    <>
      <CollectionToolbar
        count={products.length}
        total={all.length}
        sort={sort}
        facets={facets}
        filters={filters}
      />

      {products.length === 0 ? (
        <p className="py-16 text-center">
          {countActive(filters) > 0 ? (
            <>
              Nothing matches those filters.{" "}
              <Link href={`/collections/${handle}`} className="underline">
                Clear them
              </Link>
              .
            </>
          ) : (
            <>
              Nothing in this collection yet.{" "}
              <Link href="/collections/all-products" className="underline">
                Browse everything
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <ul className="m-0 mt-8 flex list-none flex-wrap p-0">
          {products.map((product, i) => (
            <Reveal
              key={product.handle}
              as="li"
              delay={(Math.min(i, 3) + 1) as 1 | 2 | 3 | 4}
              className="w-1/2 px-[8.5px] pb-[30px] imp:w-1/4"
            >
              <ProductCard product={product} priority={i < 4} />
            </Reveal>
          ))}
        </ul>
      )}
    </>
  );
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  if (!KNOWN.has(handle)) notFound();

  const meta = META[handle];
  const known = COLLECTIONS.find((c) => c.handle === handle);
  const title = meta?.title ?? known?.title ?? handle;
  const promo = ANNOUNCEMENTS[0];

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main id="MainContent" className="flex-1">
        {/* collection-header */}
        <section className="page-width pt-10 imp:pt-[50px]">
          <Reveal className="text-center">
            <h1 className="m-0">{title}</h1>
            {meta?.description ? (
              <p className="mx-auto mt-3 max-w-[42rem]">{meta.description}</p>
            ) : null}
          </Reveal>
        </section>

        {/* promo-grid: a text-only panel on the store's dimmed body colour */}
        <section className="page-width mt-8 imp:mt-[40px]">
          <Reveal className="bg-body-dim px-6 py-10 text-center">
            <h2 className="m-0">{promo.bold}</h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
              <p className="m-0">{promo.rest}</p>
              <Link href="/collections/all-products" className="btn">
                Shop now
              </Link>
            </div>
          </Reveal>
        </section>

        <div className="page-width mt-8 imp:mt-[40px] pb-16">
          {/* searchParams is runtime data, so the grid streams behind a fallback and
              the rest of the page still prerenders. The fallback reserves the exact
              grid height — the product count is static even though the ordering is
              not — so the swap causes no layout shift. */}
          <Suspense fallback={<GridSkeleton count={COLLECTION_PRODUCTS[handle]?.length ?? 0} />}>
            <Grid handle={handle} searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}
