import { cookies } from "next/headers";

import { flatten, storefront } from "./client";
import {
  ADD_CART_LINES_MUTATION,
  CREATE_CART_MUTATION,
  REMOVE_CART_LINES_MUTATION,
  UPDATE_CART_LINES_MUTATION,
  UPDATE_CART_DISCOUNT_CODES_MUTATION,
  UPDATE_CART_ATTRIBUTES_MUTATION,
} from "./mutations";
import { GET_CART_QUERY } from "./queries";
import type { Cart, CartLine } from "./types";

export const CART_COOKIE = "onvor_cart_id";

/**
 * Cart reads are per-visitor, so nothing here is wrapped in `use cache` - that
 * would leak one shopper's cart to another. Call these behind a <Suspense>
 * boundary so the rest of the route still prerenders.
 */

type RawCart = Omit<Cart, "lines"> & { lines: { edges: Array<{ node: CartLine }> } };

type UserError = { field: string[] | null; message: string };

function normalizeCart(raw: RawCart | null | undefined): Cart | null {
  if (!raw) return null;
  return { ...raw, lines: flatten(raw.lines) };
}

function assertNoUserErrors(errors: UserError[] | undefined, action: string) {
  if (errors?.length) {
    throw new Error(`${action} failed: ${errors.map((error) => error.message).join("; ")}`);
  }
}

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
};

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }, { id: string }>({
    query: GET_CART_QUERY,
    variables: { id: cartId },
    cache: "no-store",
  });

  return normalizeCart(data.cart);
}

/** Reads the cart id cookie; returns null when there's no cart yet. */
export async function getCurrentCart(): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;

  // A cart that Shopify has since completed or expired reads back as null.
  return getCart(cartId);
}

export async function createCart(lines: CartLineInput[] = []): Promise<Cart> {
  const data = await storefront<{
    cartCreate: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: CREATE_CART_MUTATION,
    variables: { lines },
    cache: "no-store",
    forwardCookies: true,
  });

  assertNoUserErrors(data.cartCreate.userErrors, "Creating cart");

  const cart = normalizeCart(data.cartCreate.cart);
  if (!cart) throw new Error("Creating cart failed: Shopify returned no cart");
  return cart;
}

export async function addCartLines(cartId: string, lines: CartLineInput[]): Promise<Cart> {
  const data = await storefront<{
    cartLinesAdd: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: ADD_CART_LINES_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
    forwardCookies: true,
  });

  assertNoUserErrors(data.cartLinesAdd.userErrors, "Adding to cart");

  const cart = normalizeCart(data.cartLinesAdd.cart);
  if (!cart) throw new Error("Adding to cart failed: Shopify returned no cart");
  return cart;
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<Cart> {
  const data = await storefront<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: UPDATE_CART_LINES_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
    forwardCookies: true,
  });

  assertNoUserErrors(data.cartLinesUpdate.userErrors, "Updating cart");

  const cart = normalizeCart(data.cartLinesUpdate.cart);
  if (!cart) throw new Error("Updating cart failed: Shopify returned no cart");
  return cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await storefront<{
    cartLinesRemove: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: REMOVE_CART_LINES_MUTATION,
    variables: { cartId, lineIds },
    cache: "no-store",
  });

  assertNoUserErrors(data.cartLinesRemove.userErrors, "Removing from cart");

  const cart = normalizeCart(data.cartLinesRemove.cart);
  if (!cart) throw new Error("Removing from cart failed: Shopify returned no cart");
  return cart;
}

export async function updateCartDiscountCodes(
  cartId: string,
  discountCodes: string[],
): Promise<Cart> {
  const data = await storefront<{
    cartDiscountCodesUpdate: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: UPDATE_CART_DISCOUNT_CODES_MUTATION,
    variables: { cartId, discountCodes },
    cache: "no-store",
  });

  assertNoUserErrors(data.cartDiscountCodesUpdate.userErrors, "Updating cart discounts");

  const cart = normalizeCart(data.cartDiscountCodesUpdate.cart);
  if (!cart) throw new Error("Updating cart discounts failed: Shopify returned no cart");
  return cart;
}

export async function updateCartAttributes(
  cartId: string,
  attributes: Array<{ key: string; value: string }>,
): Promise<Cart> {
  const data = await storefront<{
    cartAttributesUpdate: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: UPDATE_CART_ATTRIBUTES_MUTATION,
    variables: { cartId, attributes },
    cache: "no-store",
  });

  assertNoUserErrors(data.cartAttributesUpdate.userErrors, "Updating cart attributes");

  const cart = normalizeCart(data.cartAttributesUpdate.cart);
  if (!cart) throw new Error("Updating cart attributes failed: Shopify returned no cart");
  return cart;
}
