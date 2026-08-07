import { BRAND, CONTACT, SOCIALS } from "@/lib/content/onvor";
import type { CatalogProduct } from "@/lib/content/catalog";

/**
 * Structured data.
 *
 * Without it a product listing in Google is a blue link; with it, it carries the
 * price, the currency and whether the item is in stock. On a store that is the
 * difference between being scrolled past and being clicked.
 *
 * Rendered as a plain script tag rather than through `metadata`, which has no
 * slot for JSON-LD. The payload is built from our own catalog constants, never
 * from user input, so there is nothing here that could inject into the script.
 */
function Script({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Only `<` needs escaping to keep a string from closing the tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`).replace(/\/$/, "");
}

/** Organisation and site search, emitted once from the root layout. */
export function SiteJsonLd() {
  const base = siteUrl();

  return (
    <>
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: BRAND.name,
          url: base,
          logo: `${base}${BRAND.logo.src}`,
          description: BRAND.statement,
          sameAs: SOCIALS.map((social) => social.href),
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: CONTACT.email,
            telephone: `+92${CONTACT.customerService.replace(/\D/g, "").slice(1)}`,
            areaServed: BRAND.country,
            availableLanguage: ["en", "ur"],
          },
        }}
      />
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BRAND.name,
          url: base,
          potentialAction: {
            "@type": "SearchAction",
            target: `${base}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
    </>
  );
}

/** Product offer plus the breadcrumb trail the product page renders. */
export function ProductJsonLd({
  product,
  collection,
}: {
  product: CatalogProduct;
  collection?: { handle: string; title: string };
}) {
  const base = siteUrl();
  const url = `${base}/products/${product.handle}`;

  const crumbs = [
    { name: "Home", item: base },
    ...(collection
      ? [{ name: collection.title, item: `${base}/collections/${collection.handle}` }]
      : []),
    { name: product.title, item: url },
  ];

  return (
    <>
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: product.images,
          description: `${product.title} — ${product.type} in 100% cotton, cut for an easy unisex fit.`,
          category: product.type,
          brand: { "@type": "Brand", name: BRAND.wordmark },
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: BRAND.currency,
            price: product.price,
            availability: product.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: BRAND.name },
          },
        }}
      />
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: crumb.name,
            item: crumb.item,
          })),
        }}
      />
    </>
  );
}
