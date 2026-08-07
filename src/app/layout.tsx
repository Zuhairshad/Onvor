import type { Metadata } from "next";
import { Fustat, Host_Grotesk } from "next/font/google";

import { SiteJsonLd } from "@/components/theme/JsonLd";
import { BRAND } from "@/lib/content/onvor";
import "./globals.css";

/* The Impulse theme's own pairing: Host Grotesk 500 for headings, Fustat 400 body. */
const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
  // Headings and nav links are all 500; 400 and 600 were downloaded unused.
  weight: ["500"],
  display: "swap",
});

const fustat = Fustat({
  variable: "--font-fustat",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${BRAND.name} — unisex cotton basics`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.statement,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "en_PK",
    title: `${BRAND.name} — unisex cotton basics`,
    description: BRAND.statement,
  },
  twitter: { card: "summary_large_image" },
  // Shopify's own domain serves the same catalog; without this both can be
  // indexed and split the ranking between them.
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${fustat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
        <SiteJsonLd />
      </body>
    </html>
  );
}
