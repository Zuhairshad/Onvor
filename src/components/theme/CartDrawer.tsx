"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useTransition } from "react";

import { removeFromCart, updateCartLineQuantity } from "@/app/actions/cart";
import { useCart } from "@/components/theme/CartContext";
import { formatMoney } from "@/lib/money";

/**
 * Mini-cart drawer. Slides in from the right, listing the current bag with
 * per-line quantity controls and a Review order CTA that hands off to /cart -
 * the review page is where "You may also like" pairings live, so the drawer
 * stays focused on what the shopper just added.
 */
export function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, setCart } = useCart();
  const [pending, startTransition] = useTransition();

  // Lock page scroll + close on Escape while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  const changeQty = useCallback(
    (lineId: string, quantity: number) => {
      startTransition(async () => {
        const next = await updateCartLineQuantity(lineId, quantity);
        setCart(next);
      });
    },
    [setCart],
  );

  const remove = useCallback(
    (lineId: string) => {
      startTransition(async () => {
        const next = await removeFromCart(lineId);
        setCart(next);
      });
    },
    [setCart],
  );

  const lines = cart?.lines ?? [];
  const empty = lines.length === 0;

  return (
    <div
      className={[
        "fixed inset-0 z-[60] transition-opacity",
        drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!drawerOpen}
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/40"
        aria-label="Close cart"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={closeDrawer}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className={[
          "text-ink absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white shadow-xl",
          "transition-transform duration-300 ease-out",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <header className="border-hairline flex items-center justify-between border-b px-5 py-4">
          <h2 className="tracking-caps m-0 text-[13px] uppercase">
            Your bag {cart && cart.totalQuantity > 0 ? `(${cart.totalQuantity})` : ""}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="tracking-caps text-[13px] uppercase"
          >
            Close
          </button>
        </header>

        <div className={`min-h-0 flex-1 overflow-y-auto ${pending ? "opacity-70" : ""}`}>
          {empty ? (
            <div className="px-5 py-12 text-center">
              <p className="m-0">Your bag is empty.</p>
              <Link
                href="/collections/all-products"
                className="btn mt-6"
                onClick={closeDrawer}
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="m-0 list-none p-0">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="border-hairline flex gap-4 border-b px-5 py-4"
                >
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    className="w-[72px] shrink-0"
                    onClick={closeDrawer}
                  >
                    <span className="bg-body-dim relative block aspect-[2/3] w-full overflow-hidden">
                      {line.merchandise.image ? (
                        <Image
                          src={line.merchandise.image.url}
                          alt=""
                          width={line.merchandise.image.width ?? 1000}
                          height={line.merchandise.image.height ?? 1500}
                          sizes="72px"
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      className="block text-[15px] hover:underline"
                      onClick={closeDrawer}
                    >
                      {line.merchandise.product.title}
                    </Link>
                    <p className="m-0 mt-1 text-[13px] opacity-60">
                      {line.merchandise.selectedOptions.map((o) => o.value).join(" / ")}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="border-hairline rounded-btn inline-flex items-center border text-[14px]">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="px-2 py-1 leading-none disabled:opacity-40"
                          onClick={() => changeQty(line.id, line.quantity - 1)}
                          disabled={pending}
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="px-2 py-1 leading-none disabled:opacity-40"
                          onClick={() => changeQty(line.id, line.quantity + 1)}
                          disabled={pending}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[14px]">
                        {formatMoney(line.cost.totalAmount, "en-PK")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="mt-2 text-[12px] underline opacity-60 hover:opacity-100"
                      onClick={() => remove(line.id)}
                      disabled={pending}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

        </div>

        {cart && !empty ? (
          <footer className="border-hairline border-t px-5 py-4">
            <div className="mb-3 flex items-baseline justify-between text-[14px]">
              <span className="opacity-70">Subtotal</span>
              <span>{formatMoney(cart.cost.subtotalAmount, "en-PK")}</span>
            </div>
            <p className="mb-4 text-[12px] opacity-60">
              Shipping and any taxes are calculated at checkout.
            </p>
            <Link
              href="/cart"
              className="btn block w-full text-center"
              onClick={closeDrawer}
            >
              Review order
            </Link>
            <a
              href={cart.checkoutUrl}
              className="btn mt-2 block w-full border !bg-white !text-ink text-center hover:!bg-body-dim"
            >
              Checkout
            </a>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
