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
        <div className="flex flex-col flex-wrap justify-center imp:-mx-[30px] imp:flex-row">
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
