"use client";

import Image from "next/image";
import Link from "next/link";

import { PageShell } from "@/components/theme/PageShell";
import { useWishlist } from "@/components/theme/WishlistContext";
import { formatPkr } from "@/lib/money";

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();

  return (
    <PageShell>
      <div className="page-width py-10 imp:py-16">
        <header className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="m-0">Wishlist</h1>
            <p className="mt-2 text-[15px] opacity-70">
              {items.length === 0
                ? "You haven't saved anything yet."
                : `${items.length} item${items.length === 1 ? "" : "s"} saved to this browser.`}
            </p>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="text-[13px] tracking-caps uppercase underline opacity-70 hover:opacity-100"
            >
              Clear all
            </button>
          ) : null}
        </header>

        {items.length === 0 ? (
          <div className="border-hairline flex flex-col items-start gap-4 border-t pt-8">
            <p className="m-0 text-[15px]">
              Tap the heart on any product page to save it here - the list stays
              on this device so you can come back to it later.
            </p>
            <Link href="/collections/all-products" className="btn">
              Browse products
            </Link>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-8 p-0 imp:grid-cols-3 wide:grid-cols-4">
            {items.map((item) => {
              const onSale = item.compareAt && item.compareAt !== item.price;
              return (
                <li key={item.handle} className="flex flex-col">
                  <Link
                    href={`/products/${item.handle}`}
                    className="bg-body-dim relative block aspect-[2/3] w-full overflow-hidden"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 22vw, 45vw"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <Link
                      href={`/products/${item.handle}`}
                      className="text-[15px] hover:underline"
                    >
                      {item.title}
                    </Link>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2 text-[14px]">
                    {onSale && item.compareAt ? (
                      <span className="opacity-60 line-through">
                        {formatPkr(item.compareAt)}
                      </span>
                    ) : null}
                    <span>{formatPkr(item.price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.handle)}
                    className="mt-2 self-start text-[13px] underline opacity-70 hover:opacity-100"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
