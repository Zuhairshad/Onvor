// Same-origin proxy for Shopify's Storefront API.
//
// Why this exists:
//   hydrogen-react's useShopifyCookies({ fetchTrackingValues: true }) calls
//   fetch("/api/unstable/graphql.json") — a relative URL — as its first attempt.
//   Shopify issues visitor identity values (_y, _s, _cmp) via Server-Timing
//   headers on every Storefront API response. getTrackingValues() reads those
//   from the Performance API, but only matches resource entries where:
//     matchedHost === window.location.host (same-origin)
//     OR matchedHost.endsWith(`.${window.location.host}`) (child subdomain)
//   checkout.theonvor.com is a sibling of www.theonvor.com, not a child, so
//   the fallback call that hydrogen-react makes to checkoutDomain would NOT
//   match. This proxy makes the call same-origin so server-timing is readable.
//
// Flow:
//   Browser → GET/POST /api/unstable/graphql.json (same-origin: www.theonvor.com)
//   → this handler → checkout.theonvor.com/api/unstable/graphql.json
//   → Shopify responds: Server-Timing: _y=XXX, _s=YYY, _cmp=ZZZ
//   → handler copies Server-Timing into its own response
//   → getTrackingValues() reads serverTiming from the www.theonvor.com entry ✓

const UPSTREAM = "https://checkout.theonvor.com/api/unstable/graphql.json";

async function proxy(request: Request): Promise<Response> {
  const body = request.method === "POST" ? await request.text() : undefined;

  // Authenticate with the private token server-side so no public token needs
  // to be exposed to the browser. The browser sends no auth; this handler adds it.
  const privateToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";

  const res = await fetch(UPSTREAM, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...(privateToken ? { "Shopify-Storefront-Private-Token": privateToken } : {}),
    },
    ...(body !== undefined ? { body } : {}),
  });

  const responseBody = await res.text();

  const out = new Headers({
    "Content-Type": res.headers.get("content-type") ?? "application/json",
    // Allow same-origin caching to be controlled by Shopify's directives
    ...(res.headers.get("cache-control") ? { "Cache-Control": res.headers.get("cache-control")! } : {}),
  });

  // Forward server-timing so getTrackingValues() can read _y / _s / _cmp
  // from PerformanceResourceTiming.serverTiming on the same-origin entry.
  const serverTiming = res.headers.get("server-timing");
  if (serverTiming) out.set("Server-Timing", serverTiming);

  // Forward Timing-Allow-Origin for defense-in-depth.
  const timingAllowOrigin = res.headers.get("timing-allow-origin");
  if (timingAllowOrigin) out.set("Timing-Allow-Origin", timingAllowOrigin);

  return new Response(responseBody, { status: res.status, headers: out });
}

export async function GET(request: Request) {
  return proxy(request);
}

export async function POST(request: Request) {
  return proxy(request);
}
