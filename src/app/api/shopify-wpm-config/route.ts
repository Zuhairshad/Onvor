// Fetches the Web Pixels Manager config from the Shopify Liquid store and returns it
// to the headless frontend. The WPM hash changes with Shopify updates, so we fetch
// it dynamically rather than hardcoding. Cached for 1 hour.

// myshopify.com redirects to the primary domain — fetch directly from it
const LIQUID_STORE_URL = "https://checkout.theonvor.com/";

export async function GET() {
  try {
    const res = await fetch(LIQUID_STORE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ONVOR-headless/1.0)" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return Response.json({ error: "fetch failed" }, { status: 502 });
    }

    const html = await res.text();

    // Extract hashVersion: passed as 3rd arg to wpmLoader(config, baseUrl, hashVersion, ...)
    const hashMatch = html.match(/wpmLoader\([^,]+,\s*"[^"]+",\s*"([^"]+)"/);
    const hashVersion = hashMatch?.[1] ?? null;

    // Extract webPixelsConfigList JSON array
    const pixelListMatch = html.match(/"webPixelsConfigList"\s*:\s*(\[[\s\S]*?\])\s*,\s*"isMerchantRequest"/);
    let webPixelsConfigList: unknown[] = [];
    if (pixelListMatch) {
      try {
        webPixelsConfigList = JSON.parse(pixelListMatch[1]);
      } catch {
        // non-critical
      }
    }

    // Extract initData
    const initDataMatch = html.match(/"initData"\s*:\s*(\{[\s\S]*?\})\s*,\s*\}/);
    let initData: unknown = {};
    if (initDataMatch) {
      try {
        initData = JSON.parse(initDataMatch[1]);
      } catch {
        // non-critical
      }
    }

    // Extract enabledBetaFlags
    const betaMatch = html.match(/"enabledBetaFlags"\s*:\s*(\[[^\]]*\])/);
    let enabledBetaFlags: string[] = [];
    if (betaMatch) {
      try {
        enabledBetaFlags = JSON.parse(betaMatch[1]);
      } catch {
        // non-critical
      }
    }

    if (!hashVersion) {
      return Response.json({ error: "hashVersion not found" }, { status: 502 });
    }

    return Response.json(
      {
        hashVersion,
        webPixelsConfigList,
        initData,
        enabledBetaFlags,
        bundleUrl: `https://checkout.theonvor.com/cdn/wpm/b${hashVersion}m.js`,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("[shopify-wpm-config] error:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
