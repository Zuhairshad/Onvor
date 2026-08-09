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
  applyFilters,
  countActive,
  facetsFor,
  parseFilters,
} from "@/lib/content/filters";
import { ANNOUNCEMENTS, COLLECTIONS } from "@/lib/content/onvor";
import { isSortValue, type SortValue } from "@/lib/content/sort";
import { getCollection, getCollectionHandles } from "@/lib/shopify";
import { toCatalogProducts } from "@/lib/shopify/adapters";
import type { CollectionProductSortKey } from "@/lib/shopify/types";

/** Handles the nav promises but Shopify may not yet expose products for. */
const NAV_HANDLES: Set<string> = new Set(COLLECTIONS.map((collection) => collection.handle));

/** Hand-tuned copy overrides. Everything else falls back to Shopify's own title. */
const META: Record<string, { title?: string; description?: string }> = {
  men: { description: "Loose-fit tees and relaxed trousers in 100% cotton." },
  women: { description: "The same cotton basics, cut to the same easy fit." },
  "oversized-tees": {
    title: "Loose Fit Tees",
    description: "Cut a size easy and built to keep their shape.",
  },
  "t-shirt": { title: "Tops" },
  bottoms: { description: "Baggy, straight and pleated fits that move with you." },
};

function mapSort(sort: SortValue): { sortKey: CollectionProductSortKey; reverse: boolean } {
  switch (sort) {
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "title-asc":
      return { sortKey: "TITLE", reverse: false };
    case "title-desc":
      return { sortKey: "TITLE", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "COLLECTION_DEFAULT", reverse: false };
  }
}

/** Prerender every live collection except `frontpage` (homepage duplicate). */
export async function generateStaticParams() {
  const handles = await getCollectionHandles();
  return handles
    .filter(({ handle }) => handle !== "frontpage")
    .map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const override = META[handle];
  const collection = await getCollection(handle, { first: 1 });
  const title = override?.title ?? collection?.title ?? handle;
  const description = override?.description ?? collection?.description ?? undefined;
  return { title, description };
}

/** Same geometry as the real grid, so streaming it in shifts nothing. */
function GridSkeleton() {
  return (
    <>
      <div className="border-hairline flex flex-wrap items-center justify-between gap-3 border-b py-4">
        <div className="bg-body-dim rounded-btn h-[38px] w-[104px]" />
        <div className="bg-body-dim hidden h-[21px] w-[84px] imp:block" />
        <div className="bg-body-dim rounded-btn h-[38px] w-[150px]" />
      </div>
      <ul className="m-0 mt-8 flex list-none flex-wrap p-0" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
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
  const { sortKey, reverse } = mapSort(sort);

  const collection = await getCollection(handle, { first: 100, sortKey, reverse });
  const all = collection ? toCatalogProducts(collection.products) : [];
  const facets = facetsFor(all);
  const filters = parseFilters(resolved, facets);
  const products = applyFilters(all, filters);

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

  // Pleated-trousers etc. live in the nav even if the live catalog momentarily
  // has no products for them, so those handles still render (as an empty state)
  // rather than 404ing a link that sits on every page.
  const collection = await getCollection(handle, { first: 1 });
  if (!collection && !NAV_HANDLES.has(handle)) notFound();

  const override = META[handle];
  const title = override?.title ?? collection?.title ?? handle;
  const description = override?.description ?? collection?.description ?? undefined;
  const promo = ANNOUNCEMENTS[0];

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main id="MainContent" className="flex-1">
        <section className="page-width pt-10 imp:pt-[50px]">
          <Reveal className="text-center">
            <h1 className="m-0">{title}</h1>
            {description ? (
              <p className="mx-auto mt-3 max-w-[42rem]">{description}</p>
            ) : null}
          </Reveal>
        </section>

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
          <Suspense fallback={<GridSkeleton />}>
            <Grid handle={handle} searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}
