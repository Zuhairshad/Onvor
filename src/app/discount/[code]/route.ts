import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CART_COOKIE, getCart, updateCartDiscountCodes } from "@/lib/shopify";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const discountCode = decodeURIComponent(code).trim();
  const searchParams = request.nextUrl.searchParams;
  const redirectPath = searchParams.get("redirect") || "/";

  // Build the target destination URL
  const targetUrl = new URL(redirectPath, request.nextUrl.origin);

  // Set the 30-day discount_code cookie
  const response = NextResponse.redirect(targetUrl);
  response.cookies.set("discount_code", discountCode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  // If a cart already exists, apply the discount code directly
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;
    if (cartId && discountCode) {
      const existingCart = await getCart(cartId);
      if (existingCart) {
        await updateCartDiscountCodes(cartId, [discountCode]);
      }
    }
  } catch (err) {
    console.debug("[Discount Route Handler Cart Update Notice]", err);
  }

  return response;
}
