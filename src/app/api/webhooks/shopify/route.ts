import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { TAGS, collectionTag, productTag } from "@/lib/shopify";

/**
 * Shopify webhook receiver that revalidates catalog caches.
 *
 * Subscribe these topics to https://<your-domain>/api/webhooks/shopify:
 *   products/create, products/update, products/delete
 *   collections/create, collections/update, collections/delete
 *
 * Shopify signs each delivery with the webhook secret; unsigned or badly
 * signed requests are rejected so nobody can force cache churn.
 */

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const provided = Buffer.from(signature, "base64");

  // timingSafeEqual throws on length mismatch, so check that first.
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("SHOPIFY_WEBHOOK_SECRET is not set; refusing webhook");
    return new Response("Webhook not configured", { status: 500 });
  }

  // Read the raw body: the HMAC is over exact bytes, so re-serializing JSON
  // would change the digest.
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  const payload = JSON.parse(rawBody) as { handle?: string };
  const handle = payload.handle;

  // "max" gives stale-while-revalidate: shoppers keep seeing the cached page
  // while the fresh one is built, instead of a blocking miss on the next hit.
  if (topic.startsWith("products/")) {
    revalidateTag(TAGS.products, "max");
    if (handle) revalidateTag(productTag(handle), "max");
    // A product change can move it in or out of a collection listing.
    revalidateTag(TAGS.collections, "max");
  } else if (topic.startsWith("collections/")) {
    revalidateTag(TAGS.collections, "max");
    if (handle) revalidateTag(collectionTag(handle), "max");
  } else {
    // Acknowledge unknown topics so Shopify doesn't retry them.
    return Response.json({ revalidated: false, topic });
  }

  return Response.json({ revalidated: true, topic, handle: handle ?? null });
}
