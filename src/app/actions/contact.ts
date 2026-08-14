"use server";

import { shopifyConfig } from "@/lib/shopify/config";

// POST to the raw myshopify.com domain (jtszju-ha.myshopify.com), not the
// storefront domain (theonvor.com). theonvor.com will be the Next.js app after
// DNS cutover, so POSTing there loops back to this server action. The myshopify
// domain has no Cloudflare in front — that's what was blocking the 403.
const STORE_FORM_URL = `https://${shopifyConfig().domain}/contact`;

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
    ? { ok: true, message: "Thank you for subscribing! You're now on the list." }
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
