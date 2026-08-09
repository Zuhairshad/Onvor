import Image from "next/image";
import Link from "next/link";

import { formatPkr } from "@/lib/money";
import type { CatalogProduct } from "@/lib/content/catalog";

/**
 * Grid product card: portrait image with a hover swap to the second shot, a Sale
 * tag when there's a compare-at price, then title and price.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: CatalogProduct;
  /** Set on the first row so the LCP candidate is not lazy-loaded. */
  priority?: boolean;
}) {
  const [image, hoverImage] = product.images;
  const onSale = Boolean(product.compareAt && product.compareAt !== product.price);

  return (
    <div className="group relative">
      {onSale ? (
        <span className="bg-ink tracking-caps absolute top-2 left-2 z-[2] px-2 py-1 text-[11px] uppercase text-white">
          Sale
        </span>
      ) : null}

      <Link href={`/products/${product.handle}`} className="block">
        <span className="relative block aspect-[2/3] w-full overflow-hidden">
          <Image
            src={image}
            alt={product.title}
            width={1000}
            height={1500}
            sizes="(min-width: 769px) 25vw, 50vw"
            priority={priority}
            className="h-full w-full object-cover transition-opacity duration-500 imp:group-hover:opacity-0"
          />
          {hoverImage ? (
            /* Decorative and only ever seen on a pointer device. `hidden` below
               769px keeps it out of the layout, which also keeps a lazy image
               from ever being fetched there - no phone pays for a hover state it
               cannot trigger. On desktop it is fetched at low priority so it
               never competes with the visible shot above it. */
            <Image
              src={hoverImage}
              alt=""
              width={1000}
              height={1500}
              sizes="(min-width: 769px) 25vw, 50vw"
              fetchPriority="low"
              className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 imp:block imp:group-hover:opacity-100"
            />
          ) : null}
        </span>

        <span className="text-ink mt-3 block text-left">{product.title}</span>
        <span className="mt-1 flex items-baseline gap-2 text-left">
          {onSale && product.compareAt ? (
            <span className="text-ink/60 text-[15px] line-through">
              {formatPkr(product.compareAt)}
            </span>
          ) : null}
          <span className="text-ink text-[15px]">{formatPkr(product.price)}</span>
        </span>
      </Link>
    </div>
  );
}
