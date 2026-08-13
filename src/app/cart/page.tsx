import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getCartPairings } from "@/app/actions/cart";
import { CartLines } from "@/components/theme/CartLines";
import { CartPairings } from "@/components/theme/CartPairings";
import { CartSummary } from "@/components/theme/CartSummary";
import { PageHeader, PageShell } from "@/components/theme/PageShell";
import { getCurrentCart } from "@/lib/shopify";

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
        <CartSummary initialCart={cart} />
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
