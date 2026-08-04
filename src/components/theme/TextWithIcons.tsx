import { IconCotton, IconHeart, IconSparkle } from "@/components/theme/icons";
import { Reveal } from "@/components/theme/Reveal";

const BLOCKS = [
  {
    Icon: IconSparkle,
    title: "Quietly considered",
    body: "Understated details that bring polish without asking for attention.",
  },
  {
    Icon: IconCotton,
    title: "Texture you can feel",
    body: "From airy linen to soft knits, each fabric adds warmth, ease, and depth.",
  },
  {
    Icon: IconHeart,
    title: "Made for repeat wear",
    body: "Simple pieces, thoughtful layers, and a wardrobe that feels natural to come back to.",
  },
] as const;

/**
 * The three value props.
 *
 * The glyphs carry `impulse-icon`, which strokes them at 4px with no fill — the
 * reference renders these outlined, so the heart is a hollow shape rather than a
 * solid one.
 */
export function TextWithIcons() {
  return (
    <section className="section--divider index-section">
      <div className="page-width">
        <div className="flex flex-col flex-wrap justify-center imp:-mx-[30px] imp:flex-row">
          {BLOCKS.map(({ Icon, title, body }, i) => (
            <Reveal
              key={title}
              delay={(i + 1) as 1 | 2 | 3}
              className="flex flex-none flex-col p-0 pb-[60px] text-left imp:w-1/3 imp:p-[30px]"
            >
              <span className="mb-[10px] block">
                {/* 60px on mobile, 70px from 769px. */}
                <Icon className="impulse-icon text-accent h-[60px] w-[60px] imp:h-[70px] imp:w-[70px]" />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
