"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const INSTAGRAM_HREF = "https://www.instagram.com/theonvor/";

type Tile = {
  poster: string;
  video: string;
  width: number;
  height: number;
  alt: string;
};

const TILES: readonly Tile[] = [
  {
    poster: "/onvor/community/neon-studio-poster.jpg",
    video: "/onvor/community/neon-studio.mp4",
    width: 720,
    height: 1280,
    alt: "Models wearing Onvor tees in the neon studio",
  },
  {
    poster: "/onvor/community/white-tee-studio-poster.jpg",
    video: "/onvor/community/white-tee-studio.mp4",
    width: 720,
    height: 1280,
    alt: "Model styling an oversized white Onvor tee",
  },
  {
    poster: "/onvor/video/repeat-wear-poster.jpg",
    video: "/onvor/video/repeat-wear.mp4",
    width: 1080,
    height: 1920,
    alt: "Onvor repeat-wear editorial still",
  },
] as const;

function CommunityTile({ tile }: { tile: Tile }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  };

  const stopPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <Link
      href={INSTAGRAM_HREF}
      target="_blank"
      rel="noreferrer"
      aria-label={`${tile.alt} — opens Instagram in a new tab`}
      onMouseEnter={startPlayback}
      onMouseLeave={stopPlayback}
      onFocus={startPlayback}
      onBlur={stopPlayback}
      className="group relative block aspect-[9/16] overflow-hidden bg-body-dim"
    >
      <Image
        src={tile.poster}
        alt={tile.alt}
        width={tile.width}
        height={tile.height}
        sizes="(min-width: 769px) 33vw, 82vw"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <video
        ref={videoRef}
        src={tile.video}
        poster={tile.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M7 4.5A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5H7Zm10 1.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 1.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
          </svg>
        </span>
      </span>
    </Link>
  );
}

export function CommunityVideos() {
  return (
    <section
      className="section--divider bg-announcement"
      aria-labelledby="community-heading"
    >
      <div className="px-[17px] py-12 text-center imp:py-16">
        <h2
          id="community-heading"
          className="font-heading m-0 text-[28px] leading-none font-semibold uppercase imp:text-[38px]"
        >
          Community
        </h2>
        <p className="mt-4 text-[16px] imp:text-[19px]">
          Explore how our community styles it
        </p>
        <Link
          href={INSTAGRAM_HREF}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-3 border-b border-transparent pb-1 text-[15px] font-semibold transition-colors hover:border-current imp:text-[17px]"
        >
          Instagram
          <span aria-hidden className="text-[24px] leading-none">
            →
          </span>
        </Link>
      </div>

      <ul className="mx-auto m-0 flex max-w-[1200px] list-none snap-x snap-mandatory gap-2 overflow-x-auto px-[17px] pb-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden imp:grid imp:grid-cols-3 imp:overflow-visible imp:px-6 imp:pb-16">
        {TILES.map((tile) => (
          <li
            key={tile.poster}
            className="w-[82vw] max-w-[380px] shrink-0 snap-center imp:w-auto imp:max-w-none"
          >
            <CommunityTile tile={tile} />
          </li>
        ))}
      </ul>
    </section>
  );
}
