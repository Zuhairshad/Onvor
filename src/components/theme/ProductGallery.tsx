"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useProductSelectionOptional } from "./ProductSelectionContext";

/**
 * Product gallery. On mobile, a single main frame stacks above a horizontal
 * thumbnail rail. From `imp` up (769px) the thumbnails swap to a vertical
 * column on the left of the main image, so the main image reads at a smaller,
 * boutique-catalogue proportion rather than dominating the page - which is the
 * treatment used by the Impulse reference PDP.
 */
export function ProductGallery({
  images,
  title,
  variantColorImages,
}: {
  images: string[];
  title: string;
  variantColorImages?: Record<string, string[]>;
}) {
  const selection = useProductSelectionOptional();
  const selectedColor = selection?.selected["Color"];

  const resolvedImages =
    selectedColor && variantColorImages?.[selectedColor]?.length
      ? variantColorImages[selectedColor]
      : images;

  // A product is strictly allowed 1 main picture and at most 4 side pictures (max 5 total)
  const galleryImages = resolvedImages.slice(0, 5);
  const [active, setActive] = useState(0);

  // Reset to first image when the selected color changes
  useEffect(() => {
    setActive(0);
  }, [selectedColor]);

  const src = galleryImages[active] ?? galleryImages[0];
  const showThumbs = galleryImages.length > 1;

  return (
    <div className="min-w-0 imp:flex imp:gap-4">
      {showThumbs ? (
        <ul
          className="order-1 hidden shrink-0 list-none flex-col gap-3 p-0 imp:m-0 imp:flex imp:w-[72px] wide:w-[84px]"
          aria-label="Product image thumbnails"
        >
          {galleryImages.map((thumb, i) => (
            <li key={thumb}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={[
                  "relative block aspect-[2/3] w-full overflow-hidden border transition-colors",
                  i === active ? "border-ink" : "border-transparent hover:border-hairline",
                ].join(" ")}
              >
                <Image
                  src={thumb}
                  alt=""
                  width={1000}
                  height={1500}
                  sizes="84px"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="order-2 min-w-0 imp:flex-1">
        <div className="relative mx-auto block aspect-[2/3] w-full overflow-hidden bg-body-dim imp:max-w-[520px]">
          {src ? (
            <Image
              src={src}
              alt={title}
              width={1000}
              height={1500}
              sizes="(min-width: 1500px) 520px, (min-width: 769px) 45vw, 100vw"
              priority
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        {showThumbs ? (
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-3 p-0 imp:hidden">
            {galleryImages.map((thumb, i) => (
              <li key={thumb} className="w-[72px] shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1} of ${galleryImages.length}`}
                  aria-current={i === active}
                  className={[
                    "relative block aspect-[2/3] w-full overflow-hidden border transition-colors",
                    i === active ? "border-ink" : "border-transparent hover:border-hairline",
                  ].join(" ")}
                >
                  <Image
                    src={thumb}
                    alt=""
                    width={1000}
                    height={1500}
                    sizes="72px"
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
