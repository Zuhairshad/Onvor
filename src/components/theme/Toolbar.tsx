import Link from "next/link";

import { IconChevronDown, IconFacebook, IconInstagram } from "@/components/theme/icons";
import { BRAND, SOCIALS } from "@/lib/content/onvor";

const SOCIAL_ICONS = {
  Instagram: IconInstagram,
  Facebook: IconFacebook,
} as const;

const UTILITY_LINKS = [
  { label: "Size Guide", href: "/pages/size-guide" },
  { label: "Shipping & Returns", href: "/policies/refund-policy" },
  { label: "Contact", href: "/pages/contact" },
] as const;

/**
 * Utility bar above the header.
 *
 * The reference overlays this transparently on its hero, in light text. That
 * cannot work here: Onvor's banner artwork carries its own headline and its own
 * ONVOR wordmark near the top, so an overlaid bar and nav land on top of the
 * store's own branding — two wordmarks, one on the other. Their live store keeps
 * the header solid above the banner for the same reason, so this sits in normal
 * flow on the header's white instead.
 *
 * Desktop only — the reference hides it below 769px, where these links live in
 * the nav drawer instead.
 */
export function Toolbar() {
  return (
    <div className="text-ink hidden bg-white imp:block">
      <div className="page-width">
        <div className="border-hairline flex items-center justify-between border-b py-[10px] text-[14px]">
          <ul className="m-0 flex list-none items-center gap-6">
            {UTILITY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:underline" prefetch={false}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <ul className="m-0 flex list-none items-center gap-4">
              {SOCIALS.map(({ label, href }) => {
                const Icon = SOCIAL_ICONS[label as keyof typeof SOCIAL_ICONS];
                return (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener" className="block">
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="sr-only">{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Region selector is display-only until markets are configured. */}
            <span className="flex items-center gap-1.5">
              Pakistan ({BRAND.currency} Rs)
              <IconChevronDown className="h-[6px] w-[10px]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
