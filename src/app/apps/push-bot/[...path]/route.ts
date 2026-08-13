import { NextRequest, NextResponse } from "next/server";

const TARGET_HOST = "https://checkout.theonvor.com";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subPath = path.join("/");
  const url = new URL(`${TARGET_HOST}/apps/push-bot/${subPath}`);
  
  // Forward search parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const upstreamRes = await fetch(url.toString(), {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        Accept: request.headers.get("accept") || "*/*",
      },
      redirect: "follow",
      cache: "no-store",
    });

    const contentType = upstreamRes.headers.get("content-type") || "application/javascript";
    const body = await upstreamRes.arrayBuffer();

    return new NextResponse(body, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[Pushbots Proxy Error]", err);
    return new NextResponse("// Pushbots SDK proxy fallback", {
      status: 200,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subPath = path.join("/");
  const url = new URL(`${TARGET_HOST}/apps/push-bot/${subPath}`);
  
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const rawBody = await request.text();
    const upstreamRes = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/json",
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
      },
      redirect: "follow",
      body: rawBody,
    });

    const contentType = upstreamRes.headers.get("content-type") || "application/json";
    const body = await upstreamRes.arrayBuffer();

    return new NextResponse(body, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[Pushbots Proxy POST Error]", err);
    return NextResponse.json({ ok: false, error: "Proxy failure" }, { status: 502 });
  }
}
