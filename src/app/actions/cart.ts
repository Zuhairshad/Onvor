"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  CART_COOKIE,
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
  type Cart,
} from "@/lib/shopify";

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // Shopify carts last ~10 days idle; 30d cookie is harmless.

async function setCartCookie(cartId: string) {
  (await cookies()).set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

/**
 * Returns the visitor's cart id, creating a cart if there isn't one. A cookie
 * pointing at a cart Shopify has already completed is replaced rather than
 * reused — otherwise every mutation on it would fail.
 */
async function resolveCartId(): Promise<string> {
  const existing = (await cookies()).get(CART_COOKIE)?.value;

  if (existing) {
    const cart = await getCart(existing);
    if (cart) return cart.id;
  }

  const cart = await createCart();
  await setCartCookie(cart.id);
  return cart.id;
}

export async function addToCart(merchandiseId: string, quantity = 1): Promise<Cart> {
  const cartId = await resolveCartId();
  const cart = await addCartLines(cartId, [{ merchandiseId, quantity }]);
  revalidatePath("/cart");
  return cart;
}

export async function updateCartLineQuantity(lineId: string, quantity: number): Promise<Cart> {
  const cartId = await resolveCartId();

  // Shopify treats quantity 0 as a no-op rather than a removal.
  const cart =
    quantity <= 0
      ? await removeCartLines(cartId, [lineId])
      : await updateCartLines(cartId, [{ id: lineId, quantity }]);

  revalidatePath("/cart");
  return cart;
}

export async function removeFromCart(lineId: string): Promise<Cart> {
  const cartId = await resolveCartId();
  const cart = await removeCartLines(cartId, [lineId]);
  revalidatePath("/cart");
  return cart;
}
