import Link from "next/link";

import { IconFacebook, IconInstagram } from "@/components/theme/icons";
import { NewsletterForm } from "@/components/theme/NewsletterForm";
import { Reveal } from "@/components/theme/Reveal";
import { BRAND, FOOTER_MENUS, NEWSLETTER, SOCIALS } from "@/lib/content/onvor";

const MENUS = FOOTER_MENUS;

const SOCIAL_ICONS = {
  Instagram: IconInstagram,
  Facebook: IconFacebook,
} as const;

/* .footer__title / .h4 — 13px, 0.2em caps; margin-bottom 20px from 769px. */
const TITLE_CLASS =
  "tracking-caps m-0 mb-4 text-[13px] uppercase text-white imp:mb-[20px]";
/* .site-footer__linklist a — padding 4px 0; .footer__collapsible sets 14px.
   4px leaves a 28px row, which is fine for a cursor but under the 40px a thumb
   wants, so the padding opens up below the desktop breakpoint. */
const LINK_CLASS =
  "inline-block py-[9px] text-[14px] text-current hover:underline wide:py-[4px]";

/* Footer links sit below the fold and are low intent; prefetching all of them
   costs a request each on first load for no benefit. */
const NO_PREFETCH = { prefetch: false } as const;

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
                      <Link href={link.href} className={LINK_CLASS} {...NO_PREFETCH}>
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
                      <Link href={link.href} className={LINK_CLASS} {...NO_PREFETCH}>
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
            <h2 className={TITLE_CLASS}>{NEWSLETTER.footerHeading}</h2>
            <p className="mb-4 max-w-[34rem]">{BRAND.positioning}</p>

            <NewsletterForm />

            <ul className="m-0 mt-[30px] flex list-none flex-wrap items-center">
              {SOCIALS.map(({ label, href }) => {
                const Icon = SOCIAL_ICONS[label as keyof typeof SOCIAL_ICONS];
                return (
                  <li key={label} className="mr-[15px] mb-[15px] inline-block">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener"
                      className="block py-[9px] text-white wide:py-0"
                    >
                      <Icon className="h-[22px] w-[22px] imp:h-[24px] imp:w-[24px]" />
                      <span className="sr-only">{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>

        <Reveal className="border-t border-white/12 pt-6">
          <p className="m-0 mx-auto max-w-[46rem] text-center text-[14px] text-white/80">
            {BRAND.statement} {BRAND.origin}
          </p>
          <p className="m-0 py-[7.5px] pt-[15px] text-center text-[12px]">
            {BRAND.copyright}
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
