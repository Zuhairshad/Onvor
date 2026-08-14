import { CART_FRAGMENT, IMAGE_FRAGMENT, MONEY_FRAGMENT, withFragments } from "./fragments";

const CART_FRAGMENTS = [CART_FRAGMENT, IMAGE_FRAGMENT, MONEY_FRAGMENT] as const;

export const CREATE_CART_MUTATION = withFragments(
  /* GraphQL */ `
    mutation createCart($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  ...CART_FRAGMENTS,
);

export const ADD_CART_LINES_MUTATION = withFragments(
  /* GraphQL */ `
    mutation addCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  ...CART_FRAGMENTS,
);

export const UPDATE_CART_LINES_MUTATION = withFragments(
  /* GraphQL */ `
    mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  ...CART_FRAGMENTS,
);

export const REMOVE_CART_LINES_MUTATION = withFragments(
  /* GraphQL */ `
    mutation removeCartLines($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  ...CART_FRAGMENTS,
);

export const UPDATE_CART_DISCOUNT_CODES_MUTATION = withFragments(
  /* GraphQL */ `
    mutation updateCartDiscountCodes($cartId: ID!, $discountCodes: [String!]) {
      cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  ...CART_FRAGMENTS,
);

export const UPDATE_CART_ATTRIBUTES_MUTATION = withFragments(
  /* GraphQL */ `
    mutation updateCartAttributes($cartId: ID!, $attributes: [AttributeInput!]!) {
      cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  ...CART_FRAGMENTS,
);
