/**
 * Collection sort options.
 *
 * These live outside the toolbar component on purpose: the toolbar is a client
 * component, and a server component importing a plain value from a `"use client"`
 * module gets a client-reference proxy rather than the value itself - the array
 * arrives without its methods. Shared data has to sit in a module neither side
 * marks as client.
 */
export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best sellers" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "title-asc", label: "A-Z" },
  { value: "title-desc", label: "Z-A" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function isSortValue(value: string): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}
