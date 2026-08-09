"use server";

import { BRAND } from "@/lib/content/onvor";

/**
 * Newsletter and contact submissions.
 *
 * Both forms used to post straight to `/contact`, a Liquid route that only
 * exists on the Shopify domain - on a headless deploy the newsletter landed on a
 * 404 and the contact form did nothing. Shopify has no Storefront API mutation
 * for either, so the submission is forwarded server-side to the store's own form
 * endpoint, which is the same one the live theme posts to. That keeps the
 * shopper on this site and still puts the record where the shop owner looks for
 * it.
 *
 * Server-side, so the store domain is never a cross-origin request from the
 * browser and no redirect drags the visitor off to theonvor.com.
 */
const STORE_FORM_URL = `https://${BRAND.domain}/contact`;

export type FormResult = { ok: boolean; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function postToShopify(body: URLSearchParams): Promise<FormResult> {
  try {
    const response = await fetch(STORE_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      // Shopify answers a successful post with a 302 back to the form anchor.
      // Following it would download a page we do not need.
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });

    // 2xx and 3xx both mean accepted; only a 4xx/5xx is a real failure.
    if (response.status < 400) return { ok: true, message: "" };
    return {
      ok: false,
      message: "That didn't go through. Please email or WhatsApp us instead.",
    };
  } catch {
    return {
      ok: false,
      message: "We couldn't reach the server. Please email or WhatsApp us instead.",
    };
  }
}

export async function subscribeToNewsletter(
  _previous: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL.test(email)) {
    return { ok: false, message: "That email address doesn't look right." };
  }

  const result = await postToShopify(
    new URLSearchParams({
      form_type: "customer",
      utf8: "✓",
      "contact[tags]": "newsletter",
      "contact[email]": email,
    }),
  );

  return result.ok
    ? { ok: true, message: "You're on the list. Watch for your 10% code." }
    : result;
}

export async function sendContactMessage(
  _previous: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!EMAIL.test(email)) return { ok: false, message: "That email address doesn't look right." };
  if (message.length < 5) return { ok: false, message: "Add a line or two about what you need." };

  const result = await postToShopify(
    new URLSearchParams({
      form_type: "contact",
      utf8: "✓",
      "contact[Name]": name,
      "contact[email]": email,
      "contact[Phone number]": phone,
      "contact[Comment]": message,
    }),
  );

  return result.ok
    ? { ok: true, message: "Message sent. We reply within one working day." }
    : result;
}
