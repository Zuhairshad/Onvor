import type { MetadataRoute } from "next";

/**
 * robots.txt.
 *
 * The disallows are the pages that are per-visitor or infinite rather than
 * secret: a crawler indexing `/cart` gets one shopper's bag, and `/search?q=`
 * is an unbounded URL space that eats crawl budget that should go to products.
 */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://theonvor.com").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/account", "/search", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
