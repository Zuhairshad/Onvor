"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { countActive, type Facet, type Filters } from "@/lib/content/filters";

/**
 * Left-rail collection filters. Each facet gets its own `<details>` panel so
 * the section is keyboard-openable and remembers state via the browser rather
 * than React state. All writes go to the query string so the server does the
 * filtering and the result is linkable.
 */
type Props = {
  facets: Facet[];
  filters: Filters;
};

export function CollectionFilters({ facets, filters }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const active = countActive(filters);

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    router.push(qs ? `?${qs}` : "?", { scroll: false });
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

  if (facets.length === 0) return null;

  return (
    <aside className="w-full imp:w-[200px] imp:shrink-0">
      <div className="tracking-caps mb-4 flex items-center justify-between text-[12px] uppercase">
        <span>Filter</span>
        {active > 0 ? (
          <button type="button" onClick={clear} className="normal-case tracking-normal text-[13px] underline opacity-70 hover:opacity-100">
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex flex-col">
        {facets.map((facet) => (
          <details
            key={facet.key}
            open
            className="group border-hairline border-t last:border-b"
          >
            <summary className="tracking-caps flex cursor-pointer list-none items-center justify-between py-3 text-[12px] uppercase">
              {facet.label}
              <span aria-hidden className="text-[16px] leading-none transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="pb-4">
              {facet.key === "color" ? (
                <div className="flex flex-wrap gap-2">
                  {facet.values.map((value) => {
                    const on = (filters?.[facet.key] ?? []).includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={on}
                        title={value}
                        onClick={() => toggle(facet.key, value)}
                        className={`h-7 w-7 rounded-full border transition-transform ${
                          on ? "border-ink scale-110" : "border-hairline hover:scale-105"
                        }`}
                        style={{ background: colorSwatch(value) }}
                      >
                        <span className="sr-only">{value}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <ul className="m-0 list-none space-y-2 p-0">
                  {facet.values.map((value) => {
                    const on = (filters?.[facet.key] ?? []).includes(value);
                    return (
                      <li key={value}>
                        <label className="flex cursor-pointer items-center gap-2 text-[14px]">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(facet.key, value)}
                            className="h-4 w-4 accent-black"
                          />
                          {facet.labels?.[value] ?? value}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </aside>
  );
}

/**
 * Best-effort colour name to hex. Anything we don't recognise falls back to a
 * neutral swatch with the label as tooltip.
 */
function colorSwatch(name: string): string {
  const key = name.toLowerCase().trim();
  const map: Record<string, string> = {
    black: "#111111",
    "off white": "#f3efe6",
    white: "#ffffff",
    charcoal: "#3a3a3a",
    grey: "#8a8a8a",
    gray: "#8a8a8a",
    "steel grey": "#6b7078",
    olive: "#6b6a3c",
    sand: "#d8c9a8",
    stone: "#c7bfb1",
    beige: "#e5dcc7",
    brown: "#6b4a2a",
    navy: "#1e2a44",
    blue: "#2a4a7a",
    rainbow:
      "linear-gradient(90deg,#e63946,#f4a261,#e9c46a,#2a9d8f,#4361ee,#7209b7)",
  };
  return map[key] ?? "#d4d4d4";
}
