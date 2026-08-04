/**
 * Placeholder home page. The real storefront UI is built from the supplied
 * design; this stays static so `next build` succeeds before Shopify
 * credentials are in place.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Onvor</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Headless Shopify storefront. Scaffold in place, UI pending design.
        </p>
      </div>

      <dl className="grid gap-3 text-sm">
        <div className="flex gap-3">
          <dt className="w-40 shrink-0 text-zinc-500 dark:text-zinc-500">Catalog reads</dt>
          <dd className="font-mono text-xs">src/lib/shopify/catalog.ts</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-40 shrink-0 text-zinc-500 dark:text-zinc-500">Cart</dt>
          <dd className="font-mono text-xs">
            src/lib/shopify/cart.ts, src/app/actions/cart.ts
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-40 shrink-0 text-zinc-500 dark:text-zinc-500">Revalidation</dt>
          <dd className="font-mono text-xs">src/app/api/webhooks/shopify/route.ts</dd>
        </div>
      </dl>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Copy <code className="font-mono text-xs">.env.example</code> to{" "}
        <code className="font-mono text-xs">.env.local</code> and fill in the Shopify
        credentials to start pulling live data. See the README for setup.
      </p>
    </main>
  );
}
