import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductJsonLd } from "@/components/theme/JsonLd";
import { PageShell } from "@/components/theme/PageShell";
import { ProductCard } from "@/components/theme/ProductCard";
import { ProductDetails } from "@/components/theme/ProductDetails";
import { ProductForm } from "@/components/theme/ProductForm";
import { ProductGallery } from "@/components/theme/ProductGallery";
import { Reveal } from "@/components/theme/Reveal";
import { SizeGuideDrawer } from "@/components/theme/SizeGuideDrawer";
import { WishlistButton } from "@/components/theme/WishlistButton";
import { CONTACT, RETURN_POLICY } from "@/lib/content/onvor";
import {
  getProduct,
  getProductHandles,
  getProductRecommendations,
  getProducts,
} from "@/lib/shopify";
import { toCatalogProduct, toCatalogProducts } from "@/lib/shopify/adapters";

/** Prerender every product Shopify currently has. */
export async function generateStaticParams() {
  const handles = await getProductHandles();
  return handles.map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  const image = product.featuredImage?.url ?? product.images[0]?.url;
  return {
    title: product.seo.title ?? product.title,
    description:
      product.seo.description ??
      `${product.title} - ${product.productType || "cotton basics"} cut for a loose unisex fit.`,
    openGraph: image ? { images: [image] } : undefined,
    alternates: { canonical: `/products/${handle}` },
  };
}

function collectionHrefFor(type: string): { href: string; title: string } {
  const t = type.toLowerCase();
  if (t.includes("short")) return { href: "/collections/shorts", title: "Shorts" };
  if (t.includes("tee") || t.includes("t-shirt"))
    return { href: "/collections/oversized-tees", title: "Loose Fit Tees" };
  if (t.includes("trouser") || t.includes("bottom") || t.includes("pant"))
    return { href: "/collections/bottoms", title: "Bottoms" };
  return { href: "/collections/all-products", title: "All Products" };
}

async function Related({
  productId,
  productType,
  currentHandle,
}: {
  productId: string;
  productType: string;
  currentHandle: string;
}) {
  const recs = await getProductRecommendations(productId, "RELATED");
  let items = recs.filter((p) => p.handle !== currentHandle);

  if (items.length < 4 && productType) {
    const fallback = await getProducts({
      first: 8,
      query: `product_type:"${productType}"`,
    });
    const seen = new Set(items.map((p) => p.handle).concat(currentHandle));
    for (const candidate of fallback.items) {
      if (!seen.has(candidate.handle)) {
        items.push(candidate);
        seen.add(candidate.handle);
      }
    }
  }

  items = items.slice(0, 5);
  if (items.length === 0) return null;

  const cards = toCatalogProducts(items);

  return (
    <section className="index-section">
      <div className="page-width">
        <h2 className="mb-6 imp:mb-8">You might also like</h2>
        <ul className="m-0 flex list-none flex-wrap p-0">
          {cards.map((item, i) => (
            <Reveal
              key={item.handle}
              as="li"
              delay={(Math.min(i, 3) + 1) as 1 | 2 | 3 | 4}
              className="w-1/2 px-[8.5px] pb-[30px] imp:w-1/5"
            >
              <ProductCard product={item} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const catalog = toCatalogProduct(product);
  const typeLabel =
    product.productType.charAt(0).toUpperCase() + product.productType.slice(1) ||
    "Product";
  const { href: collectionHref, title: collectionTitle } = collectionHrefFor(
    product.productType,
  );

  return (
    <PageShell>
      <ProductJsonLd
        product={catalog}
        collection={{ handle: collectionHref.replace("/collections/", ""), title: collectionTitle }}
      />
      <div className="page-width pt-8 imp:pt-[40px]">
        {/* Breadcrumb - the theme keeps it small and quiet above the title. */}
        <nav aria-label="Breadcrumb" className="mb-6 text-[14px]">
          <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden className="opacity-40">
              /
            </li>
            <li>
              <Link href={collectionHref} className="hover:underline">
                {collectionTitle}
              </Link>
            </li>
            <li aria-hidden className="opacity-40">
              /
            </li>
            <li className="opacity-60">{product.title}</li>
          </ol>
        </nav>

        {/* Two-column PDP.
            `minmax(0, ...)` on both tracks is load-bearing: without it, flex/grid
            children default to `min-width: auto` and size to their intrinsic
            content - the gallery Image renders at 1000px natively, which would
            blow the media track past 55% and push the info column off-screen.
            The right track is capped at 520px so the copy stays readable at
            ultrawide (~2048px+) viewports without ballooning line length. */}
        <div className="grid grid-cols-1 gap-10 imp:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] imp:gap-10 wide:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] wide:gap-[60px]">
          <div className="min-w-0">
            <ProductGallery images={catalog.images} title={product.title} />
          </div>

          <div className="min-w-0">
            <h1 className="m-0 break-words">{product.title}</h1>
            <p className="tracking-caps mt-2 text-[13px] uppercase opacity-60">
              {typeLabel}
            </p>

            <ProductForm product={catalog} />
            <WishlistButton
              item={{
                handle: catalog.handle,
                title: product.title,
                price: catalog.price,
                compareAt: catalog.compareAt,
                image: catalog.images[0] ?? null,
              }}
            />

            <ProductDetails
              description={
                product.description?.trim() ??
                `${product.title} in 100% cotton, cut for a loose unisex fit.`
              }
              fallbackTitle={product.title}
              exchanges={`${RETURN_POLICY.headline} ${RETURN_POLICY.points[0]}`}
              contact={`Email ${CONTACT.email} or WhatsApp ${CONTACT.whatsapp}, ${CONTACT.hours}.`}
            />

            <SizeGuideDrawer productType={product.productType} />
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <Related
          productId={product.id}
          productType={product.productType}
          currentHandle={product.handle}
        />
      </Suspense>

      <div className="page-width pb-16 text-center">
        <Link href={collectionHref} className="btn">
          Shop more
        </Link>
      </div>
    </PageShell>
  );
}
