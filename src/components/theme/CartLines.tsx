"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";

import { removeFromCart, updateCartLineQuantity } from "@/app/actions/cart";
import { useCart } from "@/components/theme/CartContext";
import type { Cart } from "@/lib/shopify";
import { formatMoney } from "@/lib/money";

/** Quantity stepper and remove control for a cart line. */
export function CartLines({ cart }: { cart: Cart }) {
  const [pending, startTransition] = useTransition();
  const { setCart } = useCart();

  return (
    <ul className={`m-0 list-none p-0 ${pending ? "opacity-60" : ""}`}>
      {cart.lines.map((line) => (
        <li key={line.id} className="border-hairline flex gap-4 border-b py-6">
          <Link
            href={`/products/${line.merchandise.product.handle}`}
            className="w-[96px] shrink-0"
          >
            <span className="bg-body-dim relative block aspect-[2/3] w-full overflow-hidden">
              {line.merchandise.image ? (
                <Image
                  src={line.merchandise.image.url}
                  alt=""
                  width={line.merchandise.image.width ?? 1000}
                  height={line.merchandise.image.height ?? 1500}
                  sizes="96px"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </span>
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${line.merchandise.product.handle}`}
              className="block hover:underline"
            >
              {line.merchandise.product.title}
            </Link>
            <p className="m-0 mt-1 text-[14px] opacity-60">
              {line.merchandise.selectedOptions.map((o) => o.value).join(" / ")}
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div className="border-hairline rounded-btn inline-flex items-center border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="px-3 py-1.5 leading-none"
                  onClick={() =>
                    startTransition(async () => {
                      const next = await updateCartLineQuantity(line.id, line.quantity - 1);
                      setCart(next);
                    })
                  }
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-[15px]">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="px-3 py-1.5 leading-none"
                  onClick={() =>
                    startTransition(async () => {
                      const next = await updateCartLineQuantity(line.id, line.quantity + 1);
                      setCart(next);
                    })
                  }
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="text-[14px] underline opacity-70 hover:opacity-100"
                onClick={() =>
                  startTransition(async () => {
                    const next = await removeFromCart(line.id);
                    setCart(next);
                  })
                }
              >
                Remove
              </button>
            </div>
          </div>

          <div className="shrink-0 text-right text-[15px]">
            {formatMoney(line.cost.totalAmount, "en-PK")}
          </div>
        </li>
      ))}
    </ul>
  );
}
