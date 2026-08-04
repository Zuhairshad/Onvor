"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";

import { IconFilter } from "@/components/theme/icons";
import { SORT_OPTIONS, type SortValue } from "@/lib/content/sort";

/**
 * `.collection-filter` — the three-part row above a collection grid: a Filter
 * trigger, the product count (hidden on small screens in the reference), and the
 * sort select.
 *
 * Sorting is driven through a `?sort=` search param so the server component does
 * the ordering and the choice survives a reload or a shared link. The Filter
 * button is a placeholder until there are facets worth filtering on — Onvor's
 * variants are only size and colour, so it announces itself as disabled rather
 * than opening an empty drawer.
 */
type Props = {
  count: number;
  sort: SortValue;
};

export function CollectionToolbar({ count, sort }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const selectId = useId();

  const onSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    const qs = next.toString();
    router.push(qs ? `?${qs}` : "?", { scroll: false });
  };

  return (
    <div className="border-hairline flex flex-wrap items-center justify-between gap-3 border-b py-4">
      <button
        type="button"
        disabled
        title="Filtering arrives with the live catalog"
        className="border-hairline tracking-caps text-ink/50 rounded-btn inline-flex shrink-0 items-center gap-2 border px-4 py-2 text-[12px] uppercase"
      >
        <IconFilter className="h-4 w-4" />
        Filter
      </button>

      <p className="m-0 hidden text-[15px] imp:block">
        {count} {count === 1 ? "product" : "products"}
      </p>

      <div className="flex min-w-0 items-center gap-2">
        <label htmlFor={selectId} className="sr-only">
          Sort by
        </label>
        <select
          id={selectId}
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          className="border-hairline text-ink rounded-btn min-w-0 max-w-full border bg-white px-3 py-2 text-[14px] imp:px-4 imp:text-[15px]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
