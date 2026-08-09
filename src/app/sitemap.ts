import type { MetadataRoute } from "next";

import { getCollectionHandles, getProductHandles } from "@/lib/shopify";

/**
 * Sitemap.
 *
 * Sourced from live Shopify handles so newly-added products appear the moment
 * webhooks invalidate the cache. `lastModified` uses each node's `updatedAt`.
 */
const POLICIES = [
  "refund-policy",
  "shipping-policy",
  "privacy-policy",
  "terms-of-service",
  "contact-information",
];

const PAGES = ["/pages/lookbook", "/pages/size-guide", "/pages/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://theonvor.com").replace(/\/$/, "");

  const [products, collections] = await Promise.all([
    getProductHandles(),
    getCollectionHandles(),
  ]);

  // `frontpage` is Shopify's internal home-page collection: a duplicate of what
  // the homepage already shows, so indexing it competes with the homepage.
  const publicCollections = collections.filter((collection) => collection.handle !== "frontpage");

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...publicCollections.map((collection) => ({
      url: `${base}/collections/${collection.handle}`,
      lastModified: new Date(collection.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.handle}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...PAGES.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...POLICIES.map((handle) => ({
      url: `${base}/policies/${handle}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
