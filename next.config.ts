import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Partial Prerendering + `use cache`. The Shopify data layer in
  // src/lib/shopify leans on this: catalog reads are cached and tagged so
  // Shopify webhooks can revalidate them, while cart reads stay per-request.
  cacheComponents: true,

  images: {
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
};

export default nextConfig;
