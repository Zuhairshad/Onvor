import type { MetadataRoute } from "next";

import { COLLECTION_PRODUCTS, PRODUCTS } from "@/lib/content/catalog";
import { COLLECTIONS } from "@/lib/content/onvor";

/**
 * Sitemap.
 *
 * Sixty-one products and fourteen collections are only reachable through the nav
 * and the grids, which is a lot of depth for a crawler to find on its own — the
 * sitemap is what gets them indexed in the first place.
 *
 * `lastModified` is deliberately absent. The catalog is a dated snapshot, so any
 * date here would be a guess, and a wrong `lastmod` is worse than none: crawlers
 * that learn a site lies about it stop reading the field. Add real dates when
 * the Storefront API supplies `updatedAt`.
 */
const POLICIES = ["refund-policy", "shipping-policy", "privacy-policy", "terms-of-service", "contact-information"];

const PAGES = ["/pages/lookbook", "/pages/size-guide", "/pages/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://theonvor.com").replace(/\/$/, "");

  // `frontpage` is Shopify's internal home-page collection: a duplicate of what
  // the homepage already shows, so indexing it competes with the homepage.
  const collections = COLLECTIONS.filter((collection) => collection.handle !== "frontpage").filter(
    (collection) => collection.handle in COLLECTION_PRODUCTS || collection.count > 0,
  );

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...collections.map((collection) => ({
      url: `${base}/collections/${collection.handle}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...Object.keys(PRODUCTS).map((handle) => ({
      url: `${base}/products/${handle}`,
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
