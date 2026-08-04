import Image from "next/image";
import Link from "next/link";

import type { MegaMenuContent } from "@/lib/content/onvor";

/**
 * Full-width mega-menu panel, matching the reference theme's two shapes:
 * image-topped category columns, and text columns beside promo cards.
 *
 * Geometry from the theme's own CSS:
 *  - panel: `padding: 39px 0`, white, `box-shadow: 0 10px 20px #00000017`, and
 *    capped at the viewport height with its own scroll;
 *  - `.megamenu__inner`: flex, `align-items: flex-start`, `gap: 30px`;
 *  - `.megamenu__nav`: grid, `repeat(auto-fill, minmax(180px, 1fr))`, `gap: 30px`;
 *  - `.megamenu__promos`: `flex: 0 0 33%`, row, `gap: 30px`;
 *  - column headings are `.h5` (13px / 0.2em / uppercase) at weight 700;
 *  - links are 15px with `padding: 4px 0`.
 *
 * The panel spans the header rather than the nav item because the reference sets
 * `position: static` on a mega-menu list item, letting the panel resolve against
 * the header instead.
 */
type Props = {
  content: MegaMenuContent;
  open: boolean;
  id: string;
  onNavigate: () => void;
};

const HEADING_CLASS = "tracking-caps m-0 mb-[5px] text-[13px] font-bold uppercase";
const LINK_CLASS = "block py-[4px] text-[15px] leading-[1.4] hover:underline";

export function MegaMenu({ content, open, id, onNavigate }: Props) {
  const { columns, promos } = content;

  return (
    <div
      id={id}
      className={[
        "absolute inset-x-0 top-full z-40 bg-white text-ink shadow-[0_10px_20px_#00000017]",
        "max-h-[calc(100vh-120px)] overflow-y-auto py-[39px]",
        open ? "block" : "hidden",
      ].join(" ")}
    >
      <div className="page-width">
        <div className="flex items-start gap-[30px]">
          {/* Columns */}
          <div className="grid min-w-0 flex-1 gap-[30px] [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
            {columns.map((column) => (
              <div key={column.heading} className="max-w-[300px] min-w-[100px]">
                {column.image ? (
                  <Link href={column.headingHref ?? column.links[0].href} onClick={onNavigate}>
                    <span className="mb-[20px] block aspect-square w-full overflow-hidden">
                      <Image
                        src={column.image}
                        alt=""
                        width={1000}
                        height={1500}
                        sizes="220px"
                        className="h-full w-full object-cover"
                        style={{ objectPosition: "50% 22%" }}
                      />
                    </span>
                  </Link>
                ) : null}

                {column.headingHref ? (
                  <Link href={column.headingHref} className={HEADING_CLASS} onClick={onNavigate}>
                    {column.heading}
                  </Link>
                ) : (
                  <p className={HEADING_CLASS}>{column.heading}</p>
                )}

                <ul className="m-0 list-none">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={LINK_CLASS} onClick={onNavigate}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Promo cards — arch-topped, as the reference renders them. */}
          {promos?.length ? (
            <div className="flex min-w-0 flex-[0_0_33%] justify-end gap-[30px] overflow-hidden">
              {promos.map((promo) => (
                <Link
                  key={promo.heading}
                  href={promo.href}
                  className="block min-w-0 max-w-[240px] flex-1 text-center"
                  onClick={onNavigate}
                >
                  <span className="arch-mask mb-[15px] block aspect-square w-full">
                    <Image
                      src={promo.image}
                      alt=""
                      width={1000}
                      height={1500}
                      sizes="240px"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="block min-w-0 px-[2px]">
                    <span className="tracking-caps mb-[6px] block text-[16px] font-bold uppercase">
                      {promo.heading}
                    </span>
                    {promo.text ? (
                      <span className="mb-[12px] block text-[15px] leading-[1.4]">
                        {promo.text}
                      </span>
                    ) : null}
                    {promo.cta ? (
                      <span className="btn border-ink text-ink mt-1 inline-block bg-transparent px-4 py-2 text-[12px]">
                        {promo.cta}
                      </span>
                    ) : null}
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
