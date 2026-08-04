import type { Money } from "@/lib/shopify";

/**
 * Shopify returns amounts as decimal strings. Format with Intl rather than
 * parsing into floats for arithmetic.
 */
export function formatMoney(money: Money, locale = "en-GB"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

/**
 * Onvor prices in PKR. Shopify hands them over as decimal strings, and the store
 * quotes whole rupees, so the fractional part is dropped rather than rounded up.
 */
export function formatPkr(amount: string): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
