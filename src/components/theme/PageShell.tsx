import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/theme/AnnouncementBar";
import { Footer } from "@/components/theme/Footer";
import { Header } from "@/components/theme/Header";

/**
 * Standard chrome for every page that is not the homepage: announcement bar, the
 * solid header, main, footer. The homepage builds its own because its header
 * rides transparently over the shoppable hero.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="MainContent" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}

/** Centred page heading and optional standfirst, as the theme's page templates use. */
export function PageHeader({
  title,
  intro,
  align = "center",
}: {
  title: string;
  intro?: string;
  align?: "center" | "left";
}) {
  return (
    <section className="page-width pt-10 imp:pt-[50px]">
      <div className={align === "center" ? "text-center" : "text-left"}>
        <h1 className="m-0">{title}</h1>
        {intro ? (
          <p className={`mt-3 max-w-[42rem] ${align === "center" ? "mx-auto" : ""}`}>{intro}</p>
        ) : null}
      </div>
    </section>
  );
}
