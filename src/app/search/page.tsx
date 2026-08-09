import type { Metadata } from "next";
import { Suspense } from "react";

import { searchProducts } from "@/app/actions/search";
import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { SearchClient } from "@/app/search/SearchClient";

export const metadata: Metadata = { title: "Search" };

async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/search">["searchParams"];
}) {
  const resolved = await searchParams;
  const query = typeof resolved.q === "string" ? resolved.q.trim() : "";
  const initialResults = query ? await searchProducts(query, 40) : [];

  return <SearchClient initialQuery={query} initialResults={initialResults} />;
}

/**
 * Reserves a viewport of space so the footer never jumps up when live results
 * stream in - matches the previous fallback so the layout shift budget stays
 * inside Google's "good" band.
 */
function ResultsSkeleton() {
  return (
    <div className="min-h-screen" aria-hidden>
      <div className="border-hairline mx-auto max-w-[560px] border-b-2">
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
