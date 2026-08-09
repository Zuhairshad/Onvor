import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getCartPairings } from "@/app/actions/cart";
import { CartLines } from "@/components/theme/CartLines";
import { CartPairings } from "@/components/theme/CartPairings";
import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { getCurrentCart } from "@/lib/shopify";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Your bag" };

function Empty({ reason }: { reason?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="m-0">Your bag is empty.</p>
      {reason ? <p className="mt-2 text-[14px] opacity-70">{reason}</p> : null}
      <Link href="/collections/all-products" className="btn mt-6">
        Continue shopping
      </Link>
    </div>
  );
}

/**
 * Cart contents.
 *
 * Reads the cart-id cookie, so it is per-visitor and streams rather than
 * prerendering. Without Storefront credentials the read throws; that is caught
 * and reported plainly rather than 500ing the page, since an unconfigured
 * environment is the expected state until a token is added.
 */
async function CartBody() {
  let cart;
  try {
    cart = await getCurrentCart();
  } catch {
    return (
      <Empty reason="We couldn't load your bag. Please refresh or try again in a moment." />
    );
  }

  if (!cart || cart.lines.length === 0) return <Empty />;

  const inBag = cart.lines.map((line) => line.merchandise.product.handle);
  const pairings = await getCartPairings(inBag, 2);

  return (
    <div className="grid grid-cols-1 gap-10 imp:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] imp:gap-[60px]">
      <div className="min-w-0">
        <CartLines cart={cart} />
      </div>

      <aside className="min-w-0">
        <CartPairings products={pairings} />
        <div className="bg-body-dim p-6">
          <h2 className="m-0 text-[21px]">Summary</h2>
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
          {/* Shopify owns checkout; this hands off to its hosted flow. */}
          <a href={cart.checkoutUrl} className="btn mt-4 block w-full">
            Checkout
          </a>
          <Link
            href="/collections/all-products"
            className="mt-3 block text-center text-[14px] underline"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default function CartPage() {
  return (
    <PageShell>
      <PageHeader title="Your bag" />
      <div className="page-width pt-8 pb-16">
        <Suspense fallback={<div className="py-16 text-center opacity-60">Loading your bag…</div>}>
          <CartBody />
        </Suspense>
      </div>
    </PageShell>
  );
}
