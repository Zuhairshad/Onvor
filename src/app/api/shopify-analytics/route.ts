const MONORAIL_ENDPOINT =
  "https://jtszju-ha.myshopify.com/cdn/shop/monorail/unstable/produce_batch";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const res = await fetch(MONORAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    return new Response(null, { status: res.ok ? 200 : res.status });
  } catch {
    return new Response(null, { status: 500 });
  }
}
