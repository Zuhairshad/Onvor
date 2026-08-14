import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Cormorant_Garamond, Fustat, Host_Grotesk } from "next/font/google";

import { CartDrawer } from "@/components/theme/CartDrawer";
import { CartProvider } from "@/components/theme/CartContext";
import { CookieNotice } from "@/components/theme/CookieNotice";
import { SiteJsonLd } from "@/components/theme/JsonLd";
import { WishlistProvider } from "@/components/theme/WishlistContext";
import { ShopifyAutomationScripts } from "@/components/integrations/ShopifyAutomationScripts";
import { ShopifyFormsIntegration } from "@/components/integrations/ShopifyFormsIntegration";
import { PushbotsIntegration } from "@/components/integrations/PushbotsIntegration";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { BRAND } from "@/lib/content/onvor";
import "./globals.css";

/* Fonts. Cormorant Garamond drives display headings (H1/H2) for the boutique
   fashion feel of the reference theme; Host Grotesk stays as the utility
   caps-style face for nav, buttons and labels; Fustat is the body. */
const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
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
    default: `${BRAND.name} - unisex cotton basics`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.statement,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "en_PK",
    title: `${BRAND.name} - unisex cotton basics`,
    description: BRAND.statement,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${hostGrotesk.variable} ${fustat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartDrawer />
            <SiteJsonLd />
            <CookieNotice />
          </WishlistProvider>
        </CartProvider>
        <ShopifyAutomationScripts />
        <ShopifyFormsIntegration />
        <PushbotsIntegration />
        <AnalyticsProvider />
        <Analytics />
      </body>
    </html>
  );
}
