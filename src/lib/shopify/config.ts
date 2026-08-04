function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/**
 * Read at call time rather than module scope so importing this module during a
 * build without secrets present doesn't throw.
 */
export function shopifyConfig() {
  const domain = required("SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-07";

  return {
    domain,
    apiVersion,
    accessToken: required("SHOPIFY_STOREFRONT_ACCESS_TOKEN"),
    endpoint: `https://${domain}/api/${apiVersion}/graphql.json`,
  };
}
