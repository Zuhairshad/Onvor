"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { addVariantToCart } from "@/app/actions/cart";
import { useCart } from "@/components/theme/CartContext";
import { formatPkr } from "@/lib/money";
import type { Product, ProductVariant } from "@/lib/shopify";

/**
 * "You may also like" strip on the /cart review page. Each card lets the
 * shopper pick the option (usually Size) and add straight to the bag without
 * detouring through the PDP.
 */
type Props = { products: Product[] };

export function CartPairings({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="border-hairline mb-6 border-b pb-6">
      <h2 className="tracking-caps m-0 mb-4 text-[12px] uppercase opacity-70">
        You may also like
      </h2>
      <ul className="m-0 flex list-none flex-col gap-5 p-0">
        {products.map((product) => (
          <li key={product.handle}>
            <PairingCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function firstAvailableVariant(product: Product): ProductVariant | undefined {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0];
}

/** Prefer Size, then Color, then whatever the first option is. */
function pickPickerOption(product: Product): { name: string; values: string[] } | null {
  if (product.options.length === 0) return null;
  const preferred =
    product.options.find((o) => o.name.toLowerCase() === "size") ??
    product.options.find((o) => o.name.toLowerCase() === "color") ??
    product.options[0];
  return { name: preferred.name, values: preferred.optionValues.map((v) => v.name) };
}

function PairingCard({ product }: { product: Product }) {
  const { setCart, openDrawer } = useCart();
  const picker = pickPickerOption(product);
  const initial = firstAvailableVariant(product);
  const initialValue =
    picker && initial
      ? initial.selectedOptions.find((o) => o.name === picker.name)?.value ?? picker.values[0]
      : picker?.values[0] ?? "";
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const image = product.images[0] ?? product.featuredImage;
  const price = product.priceRange.minVariantPrice.amount;

  const selectedVariant = picker
    ? product.variants.find((v) =>
        v.selectedOptions.some((o) => o.name === picker.name && o.value === value),
      )
    : product.variants[0];

  const soldOut = !selectedVariant?.availableForSale;

  const onAdd = () => {
    if (!selectedVariant) return;
    setError(null);
    startTransition(async () => {
      try {
        const next = await addVariantToCart(selectedVariant.id, 1);
        setCart(next);
        openDrawer();
      } catch {
        setError("Couldn't add to bag. Try again.");
      }
    });
  };

  return (
    <div className="flex gap-3">
      <Link href={`/products/${product.handle}`} className="w-[72px] shrink-0">
        <span className="bg-body-dim relative block aspect-[2/3] w-full overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              width={image.width ?? 600}
              height={image.height ?? 900}
              sizes="72px"
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${product.handle}`}
          className="block truncate text-[14px] hover:underline"
        >
          {product.title}
        </Link>
        <p className="m-0 mt-0.5 text-[13px] opacity-70">{formatPkr(price)}</p>

        <div className="mt-2 flex items-center gap-2">
          {picker ? (
            <label className="shrink-0">
              <span className="sr-only">{picker.name}</span>
              <select
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={pending}
                aria-label={picker.name}
                className="border-hairline text-ink hover:border-ink focus-visible:border-ink focus-visible:outline-none w-auto appearance-none rounded-btn border bg-white px-2 py-1.5 text-[13px]"
              >
                {picker.values.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            onClick={onAdd}
            disabled={pending || soldOut || !selectedVariant}
            className="bg-ink tracking-caps min-w-0 flex-1 rounded-btn px-3 py-1.5 text-center text-[12px] uppercase text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Adding" : soldOut ? "Sold out" : "Add to bag"}
          </button>
        </div>

        {error ? <p className="mt-1 text-[12px] text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
