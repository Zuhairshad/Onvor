import {
  CART_FRAGMENT,
  COLLECTION_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  PRODUCT_FRAGMENT,
  withFragments,
} from "./fragments";

export const GET_PRODUCT_QUERY = withFragments(
  /* GraphQL */ `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        ...ProductFields
      }
    }
  `,
  PRODUCT_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
);

export const GET_PRODUCTS_QUERY = withFragments(
  /* GraphQL */ `
    query getProducts(
      $first: Int!
      $after: String
      $query: String
      $sortKey: ProductSortKeys
      $reverse: Boolean
    ) {
      products(
        first: $first
        after: $after
        query: $query
        sortKey: $sortKey
        reverse: $reverse
      ) {
        edges {
          node {
            ...ProductFields
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  PRODUCT_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
);

export const GET_COLLECTION_QUERY = withFragments(
  /* GraphQL */ `
    query getCollection(
      $handle: String!
      $first: Int!
      $after: String
      $sortKey: ProductCollectionSortKeys
      $reverse: Boolean
    ) {
      collection(handle: $handle) {
        ...CollectionFields
        products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
          edges {
            node {
              ...ProductFields
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,
  COLLECTION_FRAGMENT,
  PRODUCT_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
);

export const GET_COLLECTIONS_QUERY = withFragments(
  /* GraphQL */ `
    query getCollections($first: Int!) {
      collections(first: $first, sortKey: TITLE) {
        edges {
          node {
            ...CollectionFields
          }
        }
      }
    }
  `,
  COLLECTION_FRAGMENT,
  IMAGE_FRAGMENT,
);

export const GET_CART_QUERY = withFragments(
  /* GraphQL */ `
    query getCart($id: ID!) {
      cart(id: $id) {
        ...CartFields
      }
    }
  `,
  CART_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
);

export const GET_PRODUCT_RECOMMENDATIONS_QUERY = withFragments(
  /* GraphQL */ `
    query getProductRecommendations($productId: ID!, $intent: ProductRecommendationIntent) {
      productRecommendations(productId: $productId, intent: $intent) {
        ...ProductFields
      }
    }
  `,
  PRODUCT_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
);

/** Handles only — for generateStaticParams and sitemaps. */
export const GET_PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query getProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_COLLECTION_HANDLES_QUERY = /* GraphQL */ `
  query getCollectionHandles($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: UPDATED_AT) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
