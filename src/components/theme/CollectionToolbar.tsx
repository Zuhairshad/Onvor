"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { countActive, type Filters } from "@/lib/content/filters";
import { SORT_OPTIONS, type SortValue } from "@/lib/content/sort";

/**
 * The bar that sits above the collection grid: piece count on the left, a row
 * of inline sort links on the right (no dropdown). Sort writes to the query
 * string so the server does the sorting and the result is linkable.
 */
type Props = {
  count: number;
  sort: SortValue;
  filters: Filters;
};

export function CollectionToolbar({ count, sort, filters }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const active = countActive(filters);

  const onSort = (value: SortValue) => {
    const next = new URLSearchParams(params.toString());
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    const qs = next.toString();
    router.push(qs ? `?${qs}` : "?", { scroll: false });
  };

  return (
    <div className="border-hairline flex flex-wrap items-center justify-between gap-y-3 gap-x-6 border-b py-4">
      <p className="tracking-caps m-0 text-[12px] uppercase opacity-70">
        {count} {count === 1 ? "piece" : "pieces"}
        {active > 0 ? (
          <span className="ml-2 normal-case tracking-normal opacity-100">
            ({active} filter{active === 1 ? "" : "s"} applied)
          </span>
        ) : null}
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] uppercase tracking-caps">
        <span className="opacity-60">Sort</span>
        {SORT_OPTIONS.map((option) => {
          const on = option.value === sort;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSort(option.value)}
              aria-current={on ? "true" : undefined}
              className={`transition-opacity ${
                on ? "opacity-100 underline underline-offset-4" : "opacity-60 hover:opacity-100"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
