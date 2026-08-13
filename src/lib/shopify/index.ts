export { ShopifyError, flatten, storefront } from "./client";
export { shopifyConfig } from "./config";
export {
  getCollection,
  getCollectionHandles,
  getCollections,
  getProduct,
  getProductHandles,
  getProductRecommendations,
  getProducts,
} from "./catalog";
export type {
  CollectionOptions,
  Paginated,
  ProductListOptions,
  ProductRecommendationIntent,
} from "./catalog";
export {
  CART_COOKIE,
  addCartLines,
  createCart,
  getCart,
  getCurrentCart,
  removeCartLines,
  updateCartLines,
  updateCartDiscountCodes,
} from "./cart";
export type { CartLineInput } from "./cart";
export { TAGS, collectionTag, productTag } from "./tags";
export type * from "./types";
