import Image from "next/image";

import { Reveal } from "@/components/theme/Reveal";
import { VALUE_PROPS } from "@/lib/content/onvor";

/**
 * Onvor's three value props.
 *
 * The reference pairs each glyph with a heading and a body sentence; Onvor's live
 * store runs these heading-only, so there is no paragraph to invent. Their icons
 * are their own line drawings (93x93 PNGs), not the reference's stroked SVGs, so
 * this section does not use the `impulse-icon` treatment.
 */
export function TextWithIcons() {
  return (
    <section className="section--divider index-section">
      <div className="page-width">
        {/* The reference pulls this row out by 30px either side, but `.page-width`
            only has 17px of padding to give back, so the row hangs 13px past the
            viewport at every width below 1560px. Keeping the columns inside the
            gutter costs 60px of width and behaves the same at every size. */}
        <div className="flex flex-col flex-wrap justify-center imp:flex-row">
          {VALUE_PROPS.map(({ title, icon }, i) => (
            <Reveal
              key={title}
              delay={(i + 1) as 1 | 2 | 3}
              className="flex flex-none flex-col items-center p-0 pb-[40px] text-center imp:w-1/3 imp:p-[30px]"
            >
              <span className="mb-[10px] block">
                <Image
                  src={icon}
                  alt=""
                  width={93}
                  height={93}
                  className="h-[60px] w-[60px] imp:h-[70px] imp:w-[70px]"
                />
              </span>
              <h3 className="m-0">{title}</h3>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
