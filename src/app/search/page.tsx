import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { ProductCard } from "@/components/theme/ProductCard";
import { Reveal } from "@/components/theme/Reveal";
import { getProducts } from "@/lib/shopify";
import { toCatalogProducts } from "@/lib/shopify/adapters";

export const metadata: Metadata = { title: "Search" };

async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/search">["searchParams"];
}) {
  const resolved = await searchParams;
  const query = typeof resolved.q === "string" ? resolved.q.trim() : "";
  const results = query
    ? toCatalogProducts(
        (await getProducts({ first: 40, query, sortKey: "RELEVANCE" })).items,
      )
    : [];

  return (
    <>
      <form action="/search" className="mx-auto max-w-[520px]">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <div className="border-hairline flex items-center border-b-2">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search for tees, trousers, shorts…"
            className="w-full bg-transparent py-3 text-[16px] outline-none"
          />
          {/* Matches the input's own py-3 so the submit is a full-height tap
              target rather than an 18px strip of text. */}
          <button type="submit" className="tracking-caps shrink-0 px-2 py-3 text-[13px] uppercase">
            Search
          </button>
        </div>
      </form>

      {query ? (
        <p className="mt-6 text-center text-[15px]">
          {results.length} {results.length === 1 ? "result" : "results"} for “{query}”
        </p>
      ) : null}

      {query && results.length === 0 ? (
        <div className="py-12 text-center">
          <p className="m-0">Nothing matched that.</p>
          <Link href="/collections/all-products" className="btn mt-6">
            Browse everything
          </Link>
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className="m-0 mt-10 flex list-none flex-wrap p-0">
          {results.map((product, i) => (
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
      ) : null}
    </>
  );
}

/**
 * Reserves the space the results will occupy.
 *
 * The old fallback was 60px tall. Results are a search box, a count and a grid of
 * up to 35 cards, so the footer sat just under the fold on first paint and was
 * shoved down the moment they streamed in - a 0.48 layout shift, well into
 * Google's "poor" band. The result count is not knowable before the query is
 * read, so this reserves a viewport instead: enough that the footer starts off
 * screen and whatever arrives grows the page below the fold, where a shift costs
 * nothing.
 */
function ResultsSkeleton() {
  return (
    <div className="min-h-screen" aria-hidden>
      <div className="border-hairline mx-auto max-w-[520px] border-b-2">
        <div className="bg-body-dim my-3 h-[24px] w-2/3" />
      </div>
      <ul className="m-0 mt-10 flex list-none flex-wrap p-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="w-1/2 px-[8.5px] pb-[30px] imp:w-1/4">
            <div className="bg-body-dim aspect-[2/3] w-full" />
            <div className="bg-body-dim mt-3 h-[22px] w-3/4" />
            <div className="bg-body-dim mt-1 h-[21px] w-1/3" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <PageShell>
      <PageHeader title="Search" />
      <div className="page-width pt-8 pb-16">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </PageShell>
  );
}
