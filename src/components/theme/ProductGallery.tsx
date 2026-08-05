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

  return (
    <div>
      <div className="relative block aspect-[2/3] w-full overflow-hidden bg-body-dim">
        <Image
          src={images[active]}
          alt={title}
          width={1000}
          height={1500}
          sizes="(min-width: 769px) 50vw, 100vw"
          priority
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="m-0 mt-3 flex list-none gap-3 p-0">
          {images.map((src, i) => (
            <li key={src} className="w-[84px]">
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
                  src={src}
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
