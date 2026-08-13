"use client";

import { useMemo, useState, useTransition } from "react";

import { addToCart } from "@/app/actions/cart";
import { useCart } from "@/components/theme/CartContext";
import type { CatalogProduct } from "@/lib/content/catalog";
import { formatPkr } from "@/lib/money";
import { trackStorefrontEvent } from "@/components/integrations/ShopifyAutomationScripts";

/**
 * Variant picker and add-to-cart.
 *
 * The catalog snapshot carries option names and values but not the per-variant
 * ids Shopify needs for a cart line, so this collects the selection and hands it
 * to the cart action, which resolves the variant against the live Storefront API.
 * Until a Storefront token exists that call fails, and rather than swallow it the
 * button surfaces the reason - a silently dead add-to-cart is worse than an
 * honest one.
 */
type Props = {
  product: CatalogProduct;
};

const OPTION_ORDER = ["Size", "Color"];

export function ProductForm({ product }: Props) {
  const options = useMemo(() => {
    const entries = Object.entries(product.options);
    return entries.sort(
      ([a], [b]) =>
        (OPTION_ORDER.indexOf(a) + 1 || 99) - (OPTION_ORDER.indexOf(b) + 1 || 99),
    );
  }, [product.options]);

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map(([name, values]) => [name, values[0]])),
  );
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const { setCart, openDrawer } = useCart();

  const onSale = Boolean(product.compareAt && product.compareAt !== product.price);

  const submit = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const cart = await addToCart(product.handle, selected, quantity);
        // Feed the mirror so the header badge updates immediately, then open
        // the mini-cart so the shopper sees what they just added.
        setCart(cart);
        openDrawer();
        trackStorefrontEvent("add_to_cart", {
          handle: product.handle,
          title: product.title,
          price: product.price,
          selected_options: selected,
          quantity,
        });
      } catch {
        setMessage("Couldn't add to bag. Try again.");
      }
    });
  };

  return (
    <div>
      <div className="flex items-baseline gap-3">
        {onSale && product.compareAt ? (
          <span className="text-ink/60 text-[19px] line-through">
            {formatPkr(product.compareAt)}
          </span>
        ) : null}
        <span className="text-[21px]">{formatPkr(product.price)}</span>
        {onSale ? (
          <span className="bg-ink tracking-caps px-2 py-1 text-[11px] uppercase text-white">
            Sale
          </span>
        ) : null}
      </div>

      <div className="mt-8 space-y-6">
        {options.map(([name, values]) => (
          <fieldset key={name} className="border-0 p-0">
            <legend className="tracking-caps mb-3 text-[13px] uppercase">
              {name}
              <span className="tracking-body ml-2 normal-case opacity-60">
                {selected[name]}
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const active = selected[name] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected((s) => ({ ...s, [name]: value }))}
                    className={[
                      "rounded-btn min-w-[52px] border px-4 py-2 text-[14px] transition-colors",
                      active
                        ? "border-ink bg-ink text-white"
                        : "border-hairline text-ink hover:border-ink",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <fieldset className="border-0 p-0">
          <legend className="tracking-caps mb-3 text-[13px] uppercase">Quantity</legend>
          <div className="border-hairline rounded-btn inline-flex items-center border">
            <button
              type="button"
              className="px-4 py-2 text-[18px] leading-none disabled:opacity-40"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center text-[15px]" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="px-4 py-2 text-[18px] leading-none"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending || !product.available}
        className="btn mt-8 w-full disabled:opacity-60"
      >
        {!product.available ? "Sold out" : pending ? "Adding…" : "Add to bag"}
      </button>

      {message ? (
        <p className="mt-3 text-[14px]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
