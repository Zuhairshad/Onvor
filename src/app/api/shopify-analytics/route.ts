const MONORAIL_ENDPOINT =
  "https://jtszju-ha.myshopify.com/cdn/shop/monorail/unstable/produce_batch";

export async function GET() {
  return new Response("shopify-analytics proxy alive", { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const origin = request.headers.get("origin") ?? "https://www.theonvor.com";
    const referer = request.headers.get("referer") ?? "https://www.theonvor.com/";

    const res = await fetch(MONORAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": origin,
        "Referer": referer,
      },
      body,
    });

    const shopifyStatus = res.status;
    const shopifyBody = await res.text().catch(() => "");

    console.log(`[shopify-analytics] Shopify responded: ${shopifyStatus}`, shopifyBody.slice(0, 200));

    // Always 200 to the browser — we don't want client-side retries on Shopify errors
    return new Response(JSON.stringify({ shopifyStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[shopify-analytics] fetch error:", err);
    return new Response(null, { status: 200 });
  }
}
