import { getImageProps } from "next/image";
import Link from "next/link";

import { HeroCarousel } from "@/components/theme/HeroCarousel";
import { HERO_SLIDES } from "@/lib/content/onvor";

type SlideArt = { src: string; width: number; height: number };

/**
 * Builds one `<picture>` per slide so the browser downloads exactly one frame.
 *
 * Two `<Image>`s toggled with `hidden`/`block` would not do: a `display: none`
 * image is still fetched, so a phone would pull the 2400px landscape as well as
 * the portrait it actually shows. `getImageProps` is Next's supported route to
 * art direction — it hands back the optimizer's `srcSet` for each source, and
 * `<source media>` picks between them before the fetch starts.
 */
function pictureFor(slide: (typeof HERO_SLIDES)[number], eager: boolean) {
  const common = { alt: slide.alt, sizes: "100vw", quality: 82 } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, ...(slide.desktop as SlideArt) });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, ...(slide.mobile as SlideArt) });

  return (
    <picture>
      {/* 769px is the theme's own breakpoint, and the width at which the
          landscape art stops being too short to read. */}
      <source media="(min-width: 769px)" srcSet={desktopSrcSet} />
      <source srcSet={mobileSrcSet} />
      <img
        {...rest}
        // `rest` already carries this; naming it keeps the lint rule able to see it.
        alt={slide.alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="h-full w-full object-cover"
      />
    </picture>
  );
}

/**
 * The homepage hero: Onvor's own three-slide banner rail, in their order, with
 * their links.
 *
 * Their artwork carries the headline and the "Shop now" — the type is burnt into
 * the image — so there is no overlaid copy here. A second headline on top of a
 * baked-in one reads as a mistake, which is why the reference theme leaves the
 * text settings on these slides empty too. The whole slide is the link instead.
 */
export function HeroBanner() {
  return (
    <HeroCarousel
      labels={HERO_SLIDES.map((slide) => slide.alt)}
      slides={HERO_SLIDES.map((slide, i) => (
        <Link
          key={slide.id}
          href={slide.href}
          aria-label={slide.alt}
          className="block h-full w-full"
        >
          {pictureFor(slide, i === 0)}
        </Link>
      ))}
    />
  );
}
