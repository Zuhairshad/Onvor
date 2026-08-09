"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";

import { IconChevronDown, IconFilter } from "@/components/theme/icons";
import { countActive, type Facet, type Filters } from "@/lib/content/filters";
import { SORT_OPTIONS, type SortValue } from "@/lib/content/sort";

/**
 * `.collection-filter` — the row above a collection grid: a Filter trigger, the
 * product count, and the sort select, with the filter panel opening beneath.
 *
 * Both controls drive the query string rather than local state, so the server
 * does the filtering and sorting, the result is linkable, and the back button
 * behaves. Facets come from the products actually in the collection, so no
 * control here can return an empty grid.
 */
type Props = {
  count: number;
  total: number;
  sort: SortValue;
  facets: Facet[];
  filters: Filters;
};

export function CollectionToolbar({ count, total, sort, facets, filters }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const selectId = useId();
  const panelId = useId();
  const active = countActive(filters);
  const [open, setOpen] = useState(active > 0);

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    router.push(qs ? `?${qs}` : "?", { scroll: false });
  };

  const onSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    push(next);
  };

  const toggle = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    const current = (next.get(key) ?? "").split(",").filter(Boolean);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (updated.length) next.set(key, updated.join(","));
    else next.delete(key);
    push(next);
  };

  const clear = () => {
    const next = new URLSearchParams(params.toString());
    for (const facet of facets) next.delete(facet.key);
    push(next);
  };

  return (
    <div className="border-hairline border-b">
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={facets.length === 0}
          className="border-hairline tracking-caps rounded-btn hover:border-ink inline-flex shrink-0 items-center gap-2 border px-4 py-2 text-[12px] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconFilter className="h-4 w-4" />
          Filter
          {active > 0 ? (
            <span className="bg-ink grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] text-white">
              {active}
            </span>
          ) : null}
        </button>

        <p className="m-0 hidden text-[15px] imp:block">
          {count === total
            ? `${count} ${count === 1 ? "product" : "products"}`
            : `${count} of ${total} products`}
        </p>

        {/* Native <select> renders OS-specific chrome (rounded on macOS, boxy on
            Windows). `appearance-none` on the select strips it and we overlay
            our own chevron so the control matches the Filter pill next to it. */}
        <div className="relative inline-flex items-center">
          <label htmlFor={selectId} className="sr-only">
            Sort by
          </label>
          <select
            id={selectId}
            value={sort}
            onChange={(event) => onSort(event.target.value)}
            className="border-hairline text-ink rounded-btn hover:border-ink focus-visible:border-ink focus-visible:outline-none min-w-[132px] cursor-pointer appearance-none border bg-white pl-4 pr-9 py-2 text-[12px] tracking-caps uppercase transition-colors"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <IconChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-[6px] w-[10px] -translate-y-1/2"
          />
        </div>
      </div>

      {facets.length > 0 ? (
        <div id={panelId} hidden={!open} className="border-hairline border-t py-5">
          <div className="flex flex-col gap-6 imp:flex-row imp:gap-10">
            {facets.map((facet) => (
              <fieldset key={facet.key} className="m-0 min-w-0 border-0 p-0">
                <legend className="tracking-caps mb-3 p-0 text-[12px] uppercase opacity-60">
                  {facet.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {facet.values.map((value) => {
                    const on = filters[facet.key].includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(facet.key, value)}
                        className={`rounded-btn border px-3 py-[7px] text-[14px] transition-colors ${
                          on
                            ? "border-ink bg-ink text-white"
                            : "border-hairline text-ink hover:border-ink bg-white"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {active > 0 ? (
            <button type="button" onClick={clear} className="mt-5 text-[14px] underline">
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
