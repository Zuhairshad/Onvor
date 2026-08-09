import type { FeaturedProduct } from "@/components/theme/FeaturedCollection";
import type { CatalogProduct } from "@/lib/content/catalog";

import type { Product } from "./types";

/**
 * Adapters from the live Storefront `Product` shape to the legacy `CatalogProduct`
 * shape the display components were built against. Keeps the swap from snapshot
 * to live catalog reads mechanical — pages change, leaves do not.
 */

function pickPrice(product: Product): { price: string; compareAt: string | null } {
  const price = product.priceRange.minVariantPrice.amount;
  const cheapest = product.variants.find((v) => v.price.amount === price) ?? product.variants[0];
  const compareAt = cheapest?.compareAtPrice?.amount ?? null;
  return {
    price,
    compareAt: compareAt && Number(compareAt) > Number(price) ? compareAt : null,
  };
}

export function toCatalogProduct(product: Product): CatalogProduct {
  const images = product.images.map((image) => image.url).slice(0, 20);
  if (images.length === 1) images.push(images[0]);
  if (images.length === 0 && product.featuredImage) images.push(product.featuredImage.url);

  const options = Object.fromEntries(
    product.options.map((option) => [option.name, option.optionValues.map((value) => value.name)]),
  );

  const type = product.productType || product.tags[0] || "";
  const { price, compareAt } = pickPrice(product);

  return {
    handle: product.handle,
    title: product.title,
    type,
    price,
    compareAt,
    available: product.availableForSale,
    images,
    options,
  };
}

export function toCatalogProducts(products: Product[]): CatalogProduct[] {
  return products.map(toCatalogProduct);
}

export function toFeaturedProduct(product: Product): FeaturedProduct {
  const [image, second] = product.images;
  const { price, compareAt } = pickPrice(product);

  return {
    handle: product.handle,
    title: product.title,
    price,
    compareAt: compareAt ?? undefined,
    image: image?.url ?? product.featuredImage?.url ?? "",
    hoverImage: second?.url,
  };
}
