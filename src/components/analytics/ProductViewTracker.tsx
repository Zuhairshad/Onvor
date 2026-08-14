"use client";

import { useEffect } from "react";
import { formatEcommerceItem, trackEvent } from "@/lib/analytics";
import type { Product } from "@/lib/shopify/types";

export function ProductViewTracker({ product }: { product: Product }) {
  useEffect(() => {
    const minPrice = parseFloat(product.priceRange.minVariantPrice.amount) || 0;
    const currency = product.priceRange.minVariantPrice.currencyCode || "PKR";

    const item = formatEcommerceItem({
      id: product.variants[0]?.id || product.id,
      name: product.title,
      price: minPrice,
      category: product.productType,
      currency,
    });

    trackEvent({
      event: "product_viewed",
      product_id: product.id,
      handle: product.handle,
      title: product.title,
      product_type: product.productType,
      value: minPrice,
      currency,
      items: [item],
    });
  }, [product]);

  return null;
}
