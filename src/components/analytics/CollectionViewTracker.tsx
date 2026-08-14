"use client";

import { useEffect } from "react";
import { formatEcommerceItem, trackEvent } from "@/lib/analytics";
import type { CatalogProduct } from "@/lib/content/catalog";

export function CollectionViewTracker({
  handle,
  title,
  products,
}: {
  handle: string;
  title: string;
  products: CatalogProduct[];
}) {
  useEffect(() => {
    const items = products.slice(0, 20).map((p) =>
      formatEcommerceItem({
        id: p.handle,
        name: p.title,
        price: p.price,
        category: p.type,
      }),
    );

    trackEvent({
      event: "collection_viewed",
      handle,
      title,
      items,
    });
  }, [handle, title, products]);

  return null;
}
