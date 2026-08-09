"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { searchProducts } from "@/app/actions/search";
import { ProductCard } from "@/components/theme/ProductCard";
import type { CatalogProduct } from "@/lib/content/catalog";

/**
 * Client-side live search. Types into a debounced input that fires the
 * `searchProducts` server action; results replace in-place without a page
 * navigation. The URL still mirrors the query so a share link opens the same
 * grid, and the browser back button steps through past searches.
 */
type Props = { initialQuery: string; initialResults: CatalogProduct[] };

const DEBOUNCE_MS = 200;

export function SearchClient({ initialQuery, initialResults }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CatalogProduct[]>(initialResults);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const seq = useRef(0);
  const firstRun = useRef(true);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();

    // Mirror the query string so the URL stays shareable, without a full nav.
    const next = new URLSearchParams(params.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });

    // Empty query renders nothing via the derived visibleResults below - no
    // setState needed here (which the react-hooks/set-state-in-effect rule
    // flags as a cascading render).
    if (!q) return;

    timer.current = setTimeout(() => {
      const mine = ++seq.current;
      startTransition(async () => {
        const items = await searchProducts(q, 40);
        // Drop stale responses so a fast typist never sees an old result set.
        if (mine === seq.current) setResults(items);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // params ref is stable within a route; router is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const trimmedQuery = query.trim();
  const visibleResults = trimmedQuery.length > 0 ? results : [];
  const showEmpty = trimmedQuery.length > 0 && !pending && visibleResults.length === 0;

  return (
    <>
      <div className="mx-auto max-w-[560px]">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <div className="border-hairline flex items-center border-b-2">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="ml-1 h-5 w-5 shrink-0 opacity-60"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            id="q"
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for tees, trousers, shorts…"
            autoComplete="off"
            className="w-full bg-transparent px-3 py-3 text-[16px] outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="tracking-caps shrink-0 px-3 py-3 text-[12px] uppercase opacity-70 hover:opacity-100"
              aria-label="Clear search"
            >
              Clear
            </button>
          ) : null}
        </div>

        <p
          className="mt-3 min-h-[1.25rem] text-center text-[14px] opacity-70"
          aria-live="polite"
        >
          {query.trim().length === 0
            ? "Start typing to search"
            : pending
              ? "Searching…"
              : `${results.length} ${results.length === 1 ? "result" : "results"} for “${query.trim()}”`}
        </p>
      </div>

      {showEmpty ? (
        <div className="py-12 text-center">
          <p className="m-0">Nothing matched that.</p>
          <Link href="/collections/all-products" className="btn mt-6">
            Browse everything
          </Link>
        </div>
      ) : null}

      {visibleResults.length > 0 ? (
        <ul
          className={`m-0 mt-8 flex list-none flex-wrap p-0 transition-opacity ${pending ? "opacity-60" : "opacity-100"}`}
        >
          {visibleResults.map((product, i) => (
            <li
              key={product.handle}
              className="w-1/2 px-[8.5px] pb-[30px] imp:w-1/4"
            >
              <ProductCard product={product} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
