import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Partial Prerendering + `use cache`. The Shopify data layer in
  // src/lib/shopify leans on this: catalog reads are cached and tagged so
  // Shopify webhooks can revalidate them, while cart reads stay per-request.
  cacheComponents: true,

  images: {
    // AVIF first: typically 20-30% smaller than WebP for photographic content,
    // with WebP as the fallback for browsers that lack it.
    formats: ["image/avif", "image/webp"],

    // Any `quality` a component asks for has to be listed here, including the
    // 75 default. 82 is the middle tier the hero uses — the campaign photography
    // is only 1000px wide natively, so 95 spends bytes on detail the source
    // does not contain.
    qualities: [75, 82, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        // Onvor's own store CDN, which the catalog snapshot in
        // src/lib/content/catalog.ts points at instead of committing 60+ images.
        protocol: "https",
        hostname: "theonvor.com",
        pathname: "/cdn/shop/**",
      },
    ],
  },

  // Shopify's live sitemap listed `/blogs/news` (the default Shopify blog); the
  // headless build has no blog, so redirect the one legacy URL search engines
  // may have indexed to the homepage. `/pages/*` and `/policies/*` structures
  // match 1:1 with the Next routes and need no rewrite.
  async redirects() {
    return [
      { source: "/blogs/news", destination: "/", permanent: true },
      { source: "/blogs/:path*", destination: "/", permanent: true },
      // Shopify's auto-generated /collections/all handle is not created in the
      // headless build; the equivalent curated catalog lives at
      // /collections/all-products. Preserves inbound-link intent (shop-everything).
      { source: "/collections/all", destination: "/collections/all-products", permanent: true },
    ];
  },
};

export default nextConfig;
