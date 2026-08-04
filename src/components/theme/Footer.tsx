import Link from "next/link";

import {
  IconEmail,
  IconFacebook,
  IconInstagram,
  IconPinterest,
  IconThreads,
  IconTikTok,
  IconYouTube,
} from "@/components/theme/icons";
import { Reveal } from "@/components/theme/Reveal";

const MENUS = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/collections/2026-new" },
      { label: "Best Sellers", href: "/collections/2026-new" },
      { label: "Dresses", href: "/collections/2026-dresses" },
      { label: "Tees", href: "/collections/tees" },
      { label: "Linen", href: "/collections/2026-the-linen-edit" },
      { label: "Sale", href: "/collections/2026-sale" },
    ],
  },
  {
    title: "The Company",
    links: [
      { label: "Our Story", href: "/pages/our-story" },
      { label: "Sustainability", href: "/pages/sustainability" },
      { label: "Careers", href: "/pages/careers" },
      { label: "Brand Values", href: "#" },
    ],
  },
  {
    title: "Get Help",
    links: [
      { label: "FAQ", href: "/pages/faq-2026" },
      { label: "Shipping & Returns", href: "/pages/shipping-returns" },
      { label: "Size Guide", href: "/pages/size-chart" },
      { label: "Contact Support", href: "/pages/contact-support" },
      { label: "Gift Cards", href: "/products/gift-card" },
    ],
  },
] as const;

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/shopify", Icon: IconInstagram },
  { label: "Threads", href: "https://www.threads.net/@shopify", Icon: IconThreads },
  { label: "Facebook", href: "https://www.facebook.com/shopify", Icon: IconFacebook },
  { label: "YouTube", href: "https://www.youtube.com/user/shopify", Icon: IconYouTube },
  { label: "Pinterest", href: "https://www.pinterest.com/shopify", Icon: IconPinterest },
  { label: "TikTok", href: "https://www.tiktok.com/@shopify", Icon: IconTikTok },
] as const;

/* .footer__title / .h4 — 13px, 0.2em caps; margin-bottom 20px from 769px. */
const TITLE_CLASS =
  "tracking-caps m-0 mb-4 text-[13px] uppercase text-white imp:mb-[20px]";
/* .site-footer__linklist a — padding 4px 0; .footer__collapsible sets 14px. */
const LINK_CLASS = "inline-block py-[4px] text-[14px] text-current hover:underline";

/**
 * Site footer. Three menus at 20% each plus the newsletter at 40% from 960px;
 * two columns between 769 and 959px; stacked below that, where the menus become
 * `details` accordions as they do in the reference.
 */
export function Footer() {
  return (
    <footer className="bg-ink pb-0 text-white imp:pt-[60px] imp:pb-[60px]">
      <div className="page-width">
        <Reveal className="flex flex-wrap">
          {MENUS.map((menu, i) => (
            <div
              key={menu.title}
              className="w-full imp:w-1/2 imp:pt-10 min-[960px]:w-1/5 min-[960px]:pt-0"
            >
              {/* Accordion below 769px, plain heading + list above it. */}
              <details className="border-hairline/20 border-b imp:hidden">
                <summary className={`${TITLE_CLASS} mb-0 cursor-pointer list-none py-4`}>
                  {menu.title}
                </summary>
                <ul className="m-0 list-none pb-4">
                  {menu.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="hidden imp:block">
                <h2 className={TITLE_CLASS}>{menu.title}</h2>
                <ul className="m-0 list-none">
                  {menu.links.map((link) => (
                    <li key={`${menu.title}-${link.label}-${i}`}>
                      <Link href={link.href} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div className="w-full pt-10 imp:w-1/2 imp:pr-[60px] min-[960px]:w-2/5 min-[960px]:pt-0">
            <h2 className={TITLE_CLASS}>Sign up for Impulse updates</h2>
            <p className="mb-4 max-w-[34rem]">
              Be the first to know about our biggest and best sales. We&apos;ll never
              send more than one email a month.
            </p>

            <form className="relative inline-block w-full max-w-[300px]" action="/contact">
              <label htmlFor="newsletter-email" className="sr-only">
                Enter your email
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                className="bg-ink w-full rounded-none border-0 border-b-2 border-white py-[10px] pr-[45px] pl-0 text-white placeholder:text-white placeholder:opacity-100 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-0 -translate-y-1/2 p-1 text-white"
              >
                <IconEmail className="h-[24px] w-[26px]" />
                <span className="sr-only">Subscribe</span>
              </button>
            </form>

            <ul className="m-0 mt-[30px] flex list-none flex-wrap items-center">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label} className="mr-[15px] mb-[15px] inline-block">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener"
                    className="block text-white"
                  >
                    <Icon className="h-[22px] w-[22px] imp:h-[24px] imp:w-[24px]" />
                    <span className="sr-only">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <p className="m-0 py-[7.5px] pt-[15px] text-center text-[12px]">
          <a
            href="https://www.shopify.com"
            target="_blank"
            rel="nofollow noopener"
            className="text-current"
          >
            Powered by Shopify
          </a>
        </p>
      </div>
    </footer>
  );
}
