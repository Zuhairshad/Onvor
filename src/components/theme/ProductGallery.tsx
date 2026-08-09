"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Product gallery: a large 2:3 frame with thumbnails beneath. Most Onvor products
 * have two to five shots, so the thumbnail rail is only rendered when there is
 * more than one.
 */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const src = images[active];

  return (
    <div className="min-w-0">
      <div className="relative block aspect-[2/3] w-full overflow-hidden bg-body-dim">
        {src ? (
          <Image
            src={src}
            alt={title}
            width={1000}
            height={1500}
            /* Media track is 100vw stacked, ~1fr of a max-1500 grid from 769px
               up (capped near 900px), so 55vw is the honest upper bound and
               keeps mobile from downloading the desktop crop. */
            sizes="(min-width: 1500px) 900px, (min-width: 769px) 55vw, 100vw"
            priority
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-3 p-0">
          {images.map((thumb, i) => (
            <li key={thumb} className="w-[72px] shrink-0 imp:w-[84px]">
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
    </div>
  );
}
