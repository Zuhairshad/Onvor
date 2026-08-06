import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { ProductCard } from "@/components/theme/ProductCard";
import { Reveal } from "@/components/theme/Reveal";
import { PRODUCTS, type CatalogProduct } from "@/lib/content/catalog";

export const metadata: Metadata = { title: "Search" };

/**
 * Search over the catalog snapshot. Matches on title, product type and the
 * variant option values, so "black", "shorts" and "XL" all find something.
 * Once the Storefront API is wired this should move to its `search` query.
 */
function search(query: string): CatalogProduct[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return Object.values(PRODUCTS)
    .map((product) => {
      const haystack = [
        product.title,
        product.type,
        ...Object.values(product.options).flat(),
      ]
        .join(" ")
        .toLowerCase();
      const score = terms.filter((t) => haystack.includes(t)).length;
      return { product, score };
    })
    .filter((r) => r.score === terms.length)
    .sort((a, b) => a.product.title.localeCompare(b.product.title))
    .map((r) => r.product);
}

async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/search">["searchParams"];
}) {
  const resolved = await searchParams;
  const query = typeof resolved.q === "string" ? resolved.q : "";
  const results = query ? search(query) : [];

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

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <PageShell>
      <PageHeader title="Search" />
      <div className="page-width pt-8 pb-16">
        <Suspense fallback={<div className="h-[60px]" aria-hidden />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </PageShell>
  );
}
