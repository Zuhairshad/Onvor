import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductJsonLd } from "@/components/theme/JsonLd";
import { PageShell } from "@/components/theme/PageShell";
import { ProductCard } from "@/components/theme/ProductCard";
import { ProductForm } from "@/components/theme/ProductForm";
import { ProductGallery } from "@/components/theme/ProductGallery";
import { Reveal } from "@/components/theme/Reveal";
import { PRODUCTS, type CatalogProduct } from "@/lib/content/catalog";
import { CONTACT, RETURN_POLICY } from "@/lib/content/onvor";

/** Prerender every product in the catalog snapshot. */
export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = PRODUCTS[handle];
  if (!product) return {};
  return {
    title: product.title,
    description: `${product.title} — ${product.type} in 100% cotton, cut for a loose unisex fit.`,
    openGraph: { images: product.images.slice(0, 1) },
  };
}

/** Same type, excluding the product being viewed. */
function related(product: CatalogProduct): CatalogProduct[] {
  return Object.values(PRODUCTS)
    .filter((p) => p.handle !== product.handle && p.type === product.type)
    .slice(0, 5);
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const product = PRODUCTS[handle];
  if (!product) notFound();

  const recommendations = related(product);
  const typeLabel = product.type.charAt(0).toUpperCase() + product.type.slice(1);
  const collectionHref =
    product.type === "shorts"
      ? "/collections/shorts"
      : product.type === "Oversized T-shirt"
        ? "/collections/oversized-tees"
        : "/collections/bottoms";

  return (
    <PageShell>
      <ProductJsonLd
        product={product}
        collection={{ handle: collectionHref.replace("/collections/", ""), title: typeLabel }}
      />
      <div className="page-width pt-8 imp:pt-[40px]">
        {/* Breadcrumb — the theme keeps it small and quiet above the title. */}
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
                {typeLabel}
              </Link>
            </li>
            <li aria-hidden className="opacity-40">
              /
            </li>
            <li className="opacity-60">{product.title}</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-10 imp:flex-row imp:gap-[60px]">
          <div className="w-full imp:flex-[0_1_55%]">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="w-full imp:flex-[0_1_45%]">
            <h1 className="m-0">{product.title}</h1>
            <p className="tracking-caps mt-2 text-[13px] uppercase opacity-60">
              {typeLabel}
            </p>

            <ProductForm product={product} />

            {/* Collapsible detail, as the theme's product accordion does. */}
            <div className="mt-10">
              {[
                {
                  title: "Details",
                  body: `${product.title} in 100% cotton, cut for a loose unisex fit. Sizes ${Object.values(product.options).flat().filter((v) => ["S", "M", "L", "XL"].includes(v)).join(", ") || "S–XL"}.`,
                },
                {
                  title: "Exchanges",
                  body: `${RETURN_POLICY.headline} ${RETURN_POLICY.points[0]}`,
                },
                {
                  title: "Questions",
                  body: `Email ${CONTACT.email} or WhatsApp ${CONTACT.whatsapp}, ${CONTACT.hours}.`,
                },
              ].map((row) => (
                <details key={row.title} className="border-hairline border-t">
                  <summary className="tracking-caps cursor-pointer list-none py-4 text-[13px] uppercase">
                    {row.title}
                  </summary>
                  <p className="pb-4 text-[15px]">{row.body}</p>
                </details>
              ))}
              <div className="border-hairline border-t" />
            </div>

            <p className="mt-6 text-[14px]">
              <Link href="/pages/size-guide" className="underline">
                Size guide
              </Link>
            </p>
          </div>
        </div>
      </div>

      {recommendations.length > 0 ? (
        <section className="index-section">
          <div className="page-width">
            <h2 className="mb-6 imp:mb-8">You might also like</h2>
            <ul className="m-0 flex list-none flex-wrap p-0">
              {recommendations.map((item, i) => (
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
      ) : null}

      <div className="page-width pb-16 text-center">
        <Link href={collectionHref} className="btn">
          Shop more
        </Link>
      </div>
    </PageShell>
  );
}
