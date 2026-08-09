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
 * Utility bar above the header. The reference overlays it transparently on the
 * hero so it reads as part of the image, which is why it carries light text and
 * a hairline rule rather than its own background.
 *
 * Desktop only - the reference hides it below 769px, where these links live in
 * the nav drawer instead.
 */
export function Toolbar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden imp:block">
      <div className="page-width">
        <div className="pointer-events-auto flex items-center justify-between border-b border-white/25 py-[10px] text-[14px] text-white">
          <ul className="m-0 flex list-none items-center gap-6">
            {UTILITY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-white hover:underline" prefetch={false}>
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
                    <a href={href} target="_blank" rel="noopener" className="block text-white">
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="sr-only">{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Region selector is display-only until markets are configured. */}
            <span className="flex items-center gap-1.5 text-white">
              Pakistan ({BRAND.currency} Rs)
              <IconChevronDown className="h-[6px] w-[10px]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
