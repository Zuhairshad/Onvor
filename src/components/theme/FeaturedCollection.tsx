import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/theme/Reveal";
import { formatPkr } from "@/lib/money";

export type FeaturedProduct = {
  handle: string;
  title: string;
  price: string;
  /** Optional was-price; renders a strikethrough and a Sale tag when present. */
  compareAt?: string;
  image: string;
  /** Second shot, swapped in on hover from 769px up. */
  hoverImage?: string;
};

type Props = {
  heading: string;
  products: FeaturedProduct[];
  viewAllHref?: string;
};

/**
 * A product row: section heading with an optional "View all", then a grid that is
 * two-up on mobile and five-up from 769px, matching the reference's
 * `medium-up--one-fifth`.
 *
 * Cards carry a hover image swap, a sale tag and a quick-view affordance, as the
 * reference does. Quick view needs a cart/product modal to be useful, so it links
 * through to the product for now rather than pretending to be a modal.
 */
export function FeaturedCollection({ heading, products, viewAllHref }: Props) {
  return (
    <section className="index-section">
      <div className="page-width">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 imp:mb-8">
          <h2 className="m-0">{heading}</h2>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="btn tracking-caps border-ink text-ink min-w-0 bg-transparent px-4 py-2 text-[12px] hover:bg-transparent"
            >
              View all
            </Link>
          ) : null}
        </div>
      </div>

      <div className="page-width">
        <ul className="m-0 flex list-none flex-wrap p-0">
          {products.map((product, i) => (
            <Reveal
              key={product.handle}
              as="li"
              delay={(Math.min(i, 3) + 1) as 1 | 2 | 3 | 4}
              className="w-1/2 px-[8.5px] pb-[25px] imp:w-1/5"
            >
              <div className="group relative">
                {product.compareAt ? (
                  <span className="bg-ink tracking-caps absolute top-2 left-2 z-[2] px-2 py-1 text-[11px] uppercase text-white">
                    Sale
                  </span>
                ) : null}

                <Link href={`/products/${product.handle}`} className="block">
                  <span className="relative block aspect-[2/3] w-full overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={1000}
                        height={1500}
                        sizes="(min-width: 769px) 20vw, 39vw"
                        className="h-full w-full object-cover transition-opacity duration-500 imp:group-hover:opacity-0"
                      />
                    ) : (
                      <div className="bg-body-dim h-full w-full" />
                    )}
                    {product.hoverImage ? (
                      <Image
                        src={product.hoverImage}
                        alt=""
                        width={1000}
                        height={1500}
                        sizes="(min-width: 769px) 20vw, 39vw"
                        className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 imp:block imp:group-hover:opacity-100"
                      />
                    ) : null}
                  </span>

                  <span className="text-ink mt-3 block text-left">{product.title}</span>
                  <span className="mt-1 flex items-baseline gap-2 text-left">
                    {product.compareAt ? (
                      <span className="text-ink/60 text-[15px] line-through">
                        {formatPkr(product.compareAt)}
                      </span>
                    ) : null}
                    <span className="text-ink text-[15px]">{formatPkr(product.price)}</span>
                  </span>
                </Link>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
