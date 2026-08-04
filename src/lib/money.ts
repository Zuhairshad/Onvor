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
