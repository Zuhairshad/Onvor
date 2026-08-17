import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// WPM constructs sandbox worker URLs relative to the current page origin
// (www.theonvor.com). These files are actually served by Shopify from the
// checkout domain. Proxy them transparently so the sandbox can load.
export function middleware(request: NextRequest) {
  const url = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    "https://checkout.theonvor.com"
  );
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/web-pixels@:path*"],
};
