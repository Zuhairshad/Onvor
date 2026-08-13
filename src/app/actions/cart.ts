"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  CART_COOKIE,
  addCartLines,
  createCart,
  getCart,
  getCurrentCart,
  getProduct,
  getProducts,
  removeCartLines,
  updateCartLines,
  updateCartDiscountCodes,
  type Cart,
  type Product,
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
 * reused - otherwise every mutation on it would fail.
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

/**
 * Adds a product to the cart by handle plus its chosen options.
 *
 * The product page works from the catalog snapshot, which has option names and
 * values but not Shopify's per-variant ids, so the variant is resolved here
 * against the live Storefront API. That also means the id is never stale.
 */
export async function addToCart(
  handle: string,
  options: Record<string, string>,
  quantity = 1,
): Promise<Cart> {
  const product = await getProduct(handle);
  if (!product) throw new Error(`Unknown product: ${handle}`);

  const variant = product.variants.find((candidate) =>
    candidate.selectedOptions.every((option) => options[option.name] === option.value),
  );
  if (!variant) {
    throw new Error(
      `No variant of ${handle} matches ${JSON.stringify(options)}`,
    );
  }

  const cartId = await resolveCartId();
  const cart = await addCartLines(cartId, [{ merchandiseId: variant.id, quantity }]);
  revalidatePath("/cart");
  return cart;
}

/** Adds a known variant id directly, for callers that already resolved one. */
export async function addVariantToCart(
  merchandiseId: string,
  quantity = 1,
): Promise<Cart> {
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

export async function applyDiscountCode(code: string): Promise<Cart> {
  const cartId = await resolveCartId();
  const trimmed = code.trim();
  const cart = await updateCartDiscountCodes(cartId, trimmed ? [trimmed] : []);
  revalidatePath("/cart");
  return cart;
}

export async function removeDiscountCode(): Promise<Cart> {
  const cartId = await resolveCartId();
  const cart = await updateCartDiscountCodes(cartId, []);
  revalidatePath("/cart");
  return cart;
}

/**
 * Client-safe cart read for the header badge and drawer. Swallows read errors
 * (missing token, stale cookie) into `null` so a rendering failure never
 * disables the whole shell.
 */
export async function getCartSummary(): Promise<Cart | null> {
  try {
    return await getCurrentCart();
  } catch {
    return null;
  }
}

/**
 * Best-sellers used as pairings on the /cart review page. Excludes anything
 * already in the bag and keeps enough variant detail for an inline size picker
 * plus one-click add. Returns an empty list if the catalog can't be reached.
 */
export async function getCartPairings(
  excludeHandles: string[] = [],
  first = 2,
): Promise<Product[]> {
  try {
    const { items } = await getProducts({ first: first + excludeHandles.length + 2, sortKey: "BEST_SELLING" });
    return items
      .filter((product) => !excludeHandles.includes(product.handle))
      .slice(0, first);
  } catch {
    return [];
  }
}
