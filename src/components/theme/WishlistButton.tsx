"use client";

import { IconHeart } from "@/components/theme/icons";
import { useWishlist, type WishlistItem } from "@/components/theme/WishlistContext";

/**
 * Secondary CTA under the add-to-bag button. Toggles the current product in
 * the local wishlist and mirrors the current state in the label so the
 * shopper can tell at a glance whether a second click will remove or add.
 */
export function WishlistButton({ item }: { item: WishlistItem }) {
  const { has, toggle } = useWishlist();
  const active = has(item.handle);

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={active}
      className={[
        "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-btn border px-4 py-3 text-[14px] tracking-caps uppercase transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-ink text-ink hover:bg-ink hover:text-white",
      ].join(" ")}
    >
      <IconHeart className="h-4 w-4" filled={active} />
      {active ? "Saved to wishlist" : "Add to wishlist"}
    </button>
  );
}
