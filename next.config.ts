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
    ],
  },
};

export default nextConfig;
