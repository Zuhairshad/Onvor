/**
 * Hand-written mirrors of the Storefront API shapes this app selects. They line
 * up with the fragments in fragments.ts - if you change a fragment, change the
 * type. When the query surface grows past comfort, swap these for generated
 * types (`@shopify/api-codegen-preset`) without touching call sites.
 */

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type ProductOptionValue = {
  id: string;
  name: string;
};

export type ProductOption = {
  id: string;
  name: string;
  /** `ProductOption.values` is deprecated in the Storefront API; this replaces it. */
  optionValues: ProductOptionValue[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  tags: string[];
  vendor: string;
  productType: string;
  updatedAt: string;
  featuredImage: Image | null;
  images: Image[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  seo: {
    title: string | null;
    description: string | null;
  };
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  updatedAt: string;
  seo: {
    title: string | null;
    description: string | null;
  };
};

export type CollectionWithProducts = Collection & {
  products: Product[];
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: Image | null;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Image | null;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  /**
   * Tax and duty are deliberately absent: `CartCost.totalTaxAmount` is
   * deprecated and Shopify no longer returns those amounts. Shopify's own
   * checkout is where tax gets calculated and shown.
   */
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
};

/**
 * Storefront `ProductSortKeys`. `RELEVANCE` is only meaningful alongside a
 * search query - Shopify ignores it otherwise.
 */
export type ProductSortKey =
  | "TITLE"
  | "PRODUCT_TYPE"
  | "VENDOR"
  | "UPDATED_AT"
  | "CREATED_AT"
  | "BEST_SELLING"
  | "PRICE"
  | "ID"
  | "RELEVANCE";

/** Storefront `ProductCollectionSortKeys` - the keys valid inside a collection. */
export type CollectionProductSortKey =
  | "TITLE"
  | "PRICE"
  | "BEST_SELLING"
  | "CREATED"
  | "ID"
  | "MANUAL"
  | "COLLECTION_DEFAULT"
  | "RELEVANCE";
