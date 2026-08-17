// The correct headless endpoint uses the shop's primary domain, not myshopify.com.
// Confirmed via curl: returns 200 for server-side POST.
const MONORAIL_ENDPOINT =
  "https://checkout.theonvor.com/.well-known/shopify/monorail/unstable/produce_batch";

export async function GET() {
  return new Response("shopify-analytics proxy alive", { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const origin = request.headers.get("origin") ?? "https://www.theonvor.com";
    const referer = request.headers.get("referer") ?? "https://www.theonvor.com/";
    const cookie = request.headers.get("cookie") ?? "";
    const userAgent = request.headers.get("user-agent") ?? "";
    const acceptLanguage = request.headers.get("accept-language") ?? "en";
    const xForwardedFor = request.headers.get("x-forwarded-for") ?? "";

    const forwardHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Origin": origin,
      "Referer": referer,
      "Accept-Language": acceptLanguage,
    };

    if (cookie) forwardHeaders["Cookie"] = cookie;
    if (userAgent) forwardHeaders["User-Agent"] = userAgent;
    if (xForwardedFor) forwardHeaders["X-Forwarded-For"] = xForwardedFor;

    const res = await fetch(MONORAIL_ENDPOINT, {
      method: "POST",
      headers: forwardHeaders,
      body,
    });

    const shopifyStatus = res.status;
    const shopifyBody = await res.text().catch(() => "");

    console.log(`[shopify-analytics] Shopify responded: ${shopifyStatus}`, shopifyBody.slice(0, 300));

    return new Response(JSON.stringify({ shopifyStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[shopify-analytics] fetch error:", err);
    return new Response(null, { status: 200 });
  }
}
