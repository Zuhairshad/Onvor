"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { applyDiscountCode, removeDiscountCode } from "@/app/actions/cart";
import { useCart } from "@/components/theme/CartContext";
import { formatMoney } from "@/lib/money";
import { getStoredDiscountCode, setDiscountCookie } from "@/lib/discounts";
import { appendAttributionToUrl, formatEcommerceItem, trackEvent } from "@/lib/analytics";
import type { Cart } from "@/lib/shopify";

export function CartSummary({ initialCart }: { initialCart: Cart }) {
  const { cart: contextCart, setCart } = useCart();
  const cart = contextCart || initialCart;
  const [pending, startTransition] = useTransition();
  const [discountInput, setDiscountInput] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);

  const activeDiscountCode =
    cart.discountCodes?.find((d) => d.applicable)?.code || getStoredDiscountCode();

  const handleApplyDiscount = (codeToApply?: string) => {
    const code = (codeToApply || discountInput).trim();
    if (!code) return;
    setDiscountError(null);
    startTransition(async () => {
      try {
        const next = await applyDiscountCode(code);
        setCart(next);
        setDiscountCookie(code);
        setDiscountInput("");
      } catch {
        setDiscountError("Could not apply discount code.");
      }
    });
  };

  const handleRemoveDiscount = () => {
    setDiscountError(null);
    startTransition(async () => {
      try {
        const next = await removeDiscountCode();
        setCart(next);
      } catch {
        // no-op
      }
    });
  };

  const checkoutUrlWithDiscount = () => {
    if (!cart.checkoutUrl) return "#";
    const discount = activeDiscountCode || getStoredDiscountCode();
    let finalUrl = cart.checkoutUrl;
    if (discount) {
      try {
        const url = new URL(cart.checkoutUrl);
        if (!url.searchParams.has("discount")) {
          url.searchParams.set("discount", discount);
        }
        finalUrl = url.toString();
      } catch {
        finalUrl = cart.checkoutUrl;
      }
    }
    return appendAttributionToUrl(finalUrl);
  };

  return (
    <div className="bg-body-dim p-6">
      <h2 className="m-0 text-[21px]">Summary</h2>

      {/* Promo / Discount Code Entry */}
      <div className="mt-4 mb-4">
        {activeDiscountCode ? (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-800 border border-emerald-200">
            <div className="flex items-center gap-1.5 font-medium">
              <span>🏷️</span>
              <span className="font-mono font-bold uppercase">{activeDiscountCode}</span>
              <span className="text-[11px] text-emerald-600 font-normal">(Applied)</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveDiscount}
              disabled={pending}
              className="text-[12px] text-neutral-500 hover:text-red-600 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyDiscount();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Promo code"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[13px] placeholder:text-neutral-400 focus:border-ink focus:outline-none uppercase font-mono"
              />
              <button
                type="submit"
                disabled={pending || !discountInput.trim()}
                className="rounded-md bg-ink px-4 py-2 text-[12px] font-semibold text-white hover:bg-neutral-800 disabled:opacity-40"
              >
                Apply
              </button>
            </form>
            {discountError && (
              <p className="text-[11px] text-red-600 m-0">{discountError}</p>
            )}
          </div>
        )}
      </div>

      <dl className="mt-4 space-y-2 text-[15px]">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="m-0">{formatMoney(cart.cost.subtotalAmount, "en-PK")}</dd>
        </div>
        <div className="border-hairline/40 flex justify-between border-t pt-2 font-bold">
          <dt>Total</dt>
          <dd className="m-0">{formatMoney(cart.cost.totalAmount, "en-PK")}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[13px] opacity-70">
        Shipping and any taxes are calculated at checkout.
      </p>
      {/* Checkout Button */}
      <a
        href={checkoutUrlWithDiscount()}
        onClick={() => {
          const total = parseFloat(cart.cost.totalAmount.amount) || 0;
          const currency = cart.cost.totalAmount.currencyCode || "PKR";
          const items = cart.lines.map((line) =>
            formatEcommerceItem({
              id: line.merchandise.id,
              name: line.merchandise.product.title,
              price: line.cost.totalAmount.amount,
              quantity: line.quantity,
              variant: line.merchandise.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" / "),
              currency,
            }),
          );

          trackEvent({
            event: "checkout_started",
            cart_id: cart.id,
            value: total,
            currency,
            items,
          });
        }}
        className="btn mt-4 block w-full text-center"
      >
        Checkout
      </a>
      <Link
        href="/collections/all-products"
        className="mt-3 block text-center text-[14px] underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}
