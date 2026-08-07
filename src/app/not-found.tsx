import type { Metadata } from "next";
import Link from "next/link";

import { AnnouncementBar } from "@/components/theme/AnnouncementBar";
import { Footer } from "@/components/theme/Footer";
import { Header } from "@/components/theme/Header";
import { Reveal } from "@/components/theme/Reveal";
import { COLLECTIONS } from "@/lib/content/onvor";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** The ways out, in the order someone landing here is most likely to want them. */
const WAYS_OUT = ["all-products", "oversized-tees", "bottoms", "men", "women"] as const;

/**
 * 404.
 *
 * Next's default is an unstyled line of text with no header, no footer and no
 * way back — a dead end on a store where dead URLs are routine, since every
 * discontinued product leaves one behind. This keeps the chrome, so the nav and
 * search are still there, and offers the collections rather than just an
 * apology.
 */
export default function NotFound() {
  const links = WAYS_OUT.map((handle) =>
    COLLECTIONS.find((collection) => collection.handle === handle),
  ).filter((collection) => collection !== undefined);

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main id="MainContent" className="flex-1">
        <div className="page-width py-20 text-center imp:py-[110px]">
          <Reveal>
            <p className="tracking-caps m-0 text-[13px] uppercase opacity-60">404</p>
            <h1 className="mt-3 mb-0">This page has moved on</h1>
            <p className="mx-auto mt-3 max-w-[38rem]">
              The link is broken or the piece has sold out and been retired. The rest of the
              collection is still here.
            </p>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/collections/all-products" className="btn">
                Shop all
              </Link>
              <Link
                href="/search"
                className="btn border-ink text-ink bg-transparent hover:bg-transparent"
              >
                Search
              </Link>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <ul className="m-0 mt-10 flex list-none flex-wrap justify-center gap-x-6 gap-y-2 p-0 text-[15px]">
              {links.map((collection) => (
                <li key={collection.handle}>
                  <Link href={`/collections/${collection.handle}`} className="hover:underline">
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
