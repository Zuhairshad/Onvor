import { NextRequest, NextResponse } from "next/server";

const MONORAIL_ENDPOINT =
  "https://jtszju-ha.myshopify.com/cdn/shop/monorail/unstable/produce_batch";

// Server-side proxy for Shopify's Monorail analytics endpoint.
// Shopify blocks cross-origin POST from browser (CORS), but server-to-server
// has no CORS restrictions — the request originates from Vercel, not the browser.
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const res = await fetch(MONORAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    return new NextResponse(null, { status: res.ok ? 200 : res.status });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
