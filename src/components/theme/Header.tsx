"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  IconBag,
  IconChevronDown,
  IconHamburger,
  IconSearch,
  IconUser,
} from "@/components/theme/icons";
import { MegaMenu } from "@/components/theme/MegaMenu";
import { BRAND, MEGA_MENUS, NAV } from "@/lib/content/onvor";

type NavItem = {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
};

const ITEMS: readonly NavItem[] = NAV;
const SPLIT = Math.ceil(ITEMS.length / 2);
const NAV_LEFT = ITEMS.slice(0, SPLIT);
const NAV_RIGHT = ITEMS.slice(SPLIT);

/**
 * .site-nav__link — padding 7.5px 15px. Note the font: the reference header opts
 * into `site-header--heading-style`, so nav links are set in the heading face
 * (Host Grotesk 500 / line-height 1.1), not the body face.
 */
const LINK_CLASS =
  "relative inline-flex items-center gap-1.5 whitespace-nowrap px-[15px] py-[7.5px] " +
  "font-heading text-[14px] leading-[1.1] font-medium " +
  "after:absolute after:inset-x-[15px] after:bottom-[3px] after:h-px after:origin-left " +
  "after:scale-x-0 after:bg-current after:transition-transform hover:after:scale-x-100";

const menuId = (label: string) => `megamenu-${label.replace(/\s+/g, "-").toLowerCase()}`;

type NavLinkProps = {
  item: NavItem;
  /** Label of the menu currently open, if any. */
  openMenu: string | null;
  onOpen: (label: string | null) => void;
};

function NavLink({ item, openMenu, onOpen }: NavLinkProps) {
  const hasMega = item.label in MEGA_MENUS;
  const open = openMenu === item.label;

  if (!hasMega) {
    return (
      <li onMouseEnter={() => onOpen(null)}>
        <Link href={item.href} className={LINK_CLASS}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li onMouseEnter={() => onOpen(item.label)}>
      <Link
        href={item.href}
        className={`${LINK_CLASS} ${open ? "after:scale-x-100" : ""}`}
        aria-expanded={open}
        aria-controls={menuId(item.label)}
        onFocus={() => onOpen(item.label)}
      >
        {item.label}
        <IconChevronDown className="h-[6px] w-[10px]" />
      </Link>
    </li>
  );
}

type HeaderProps = {
  /**
   * True on pages whose first section is a full-bleed hero. The header then rides
   * transparently over the image until the visitor scrolls, matching the
   * reference's overlaid header.
   */
  overlay?: boolean;
};

export function Header({ overlay = false }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const hamburger = useRef<HTMLButtonElement | null>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    hamburger.current?.focus();
  }, []);

  // Leave the transparent state as soon as the hero starts scrolling away.
  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openMenu]);

  // Lock scroll and move focus into the drawer while it is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  // A white panel under a transparent header would look detached, so an open
  // mega menu forces the solid treatment.
  const isLight = overlay && !scrolled && !openMenu;

  return (
    <header
      className={[
        "inset-x-0 z-30 transition-colors duration-200",
        // Absolute while riding the hero, fixed once scrolled. Both are out of
        // flow and render at the same spot at scroll 0, so the swap is seamless.
        overlay ? (scrolled ? "fixed top-0" : "absolute top-[39px] imp:top-[45px]") : "sticky top-0",
        isLight
          ? "bg-transparent text-white"
          : "text-ink bg-white shadow-[0_0_1px_rgba(0,0,0,0.2)]",
      ].join(" ")}
    >
      <div
        className="page-width"
        onMouseLeave={() => setOpenMenu(null)}
      >
        {/* .site-header — padding 7px 0 mobile, 20px 0 from 769px. */}
        <div className="flex items-center justify-between gap-4 py-[7px] imp:py-[20px]">
          {/* Left: search on desktop, drawer trigger below 1024px. */}
          <div className="-ml-[7.5px] flex flex-1 items-center wide:-ml-[12px] wide:flex-none">
            <Link
              href="/search"
              className="hidden px-[12px] py-[7.5px] wide:block"
              aria-label="Search"
              prefetch={false}
            >
              <IconSearch className="h-5 w-5" />
            </Link>
            <button
              ref={hamburger}
              type="button"
              className="px-[7.5px] py-[10px] wide:hidden"
              aria-expanded={drawerOpen}
              aria-label="Site navigation"
              onClick={() => setDrawerOpen(true)}
            >
              <IconHamburger className="h-5 w-5" />
            </button>
          </div>

          {/* Centre: split nav around the logo on desktop; logo alone on mobile. */}
          <nav aria-label="Primary" className="flex items-center justify-center wide:flex-1">
            <ul className="hidden list-none items-center wide:flex wide:flex-1 wide:justify-end">
              {NAV_LEFT.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  openMenu={openMenu}
                  onOpen={setOpenMenu}
                />
              ))}
            </ul>

            <Link
              href="/"
              className="my-[10px] block shrink-0 wide:mx-[30px]"
              aria-label={`${BRAND.name} — home`}
            >
              <Image
                src={BRAND.logo.src}
                alt={BRAND.wordmark}
                width={BRAND.logo.width}
                height={BRAND.logo.height}
                // Without this the browser picks the largest srcset candidate for
                // a 128px box.
                sizes="128px"
                priority
                // The wordmark is solid black on transparent, so it inverts to
                // white cleanly while the header rides over the hero.
                className={`h-auto w-[104px] wide:w-[128px] ${isLight ? "brightness-0 invert" : ""}`}
              />
            </Link>

            <ul className="hidden list-none items-center wide:flex wide:flex-1">
              {NAV_RIGHT.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  openMenu={openMenu}
                  onOpen={setOpenMenu}
                />
              ))}
            </ul>
          </nav>

          {/* Right: account and cart. */}
          <div className="-mr-[7.5px] flex flex-1 items-center justify-end wide:-mr-[12px] wide:flex-none">
            <Link
              href="/account"
              className="px-[7.5px] py-[10px] wide:px-[12px]"
              aria-label="Account"
              prefetch={false}
            >
              <IconUser className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="px-[7.5px] py-[10px] wide:px-[12px]"
              aria-label="Cart"
              prefetch={false}
            >
              <IconBag className="h-5 w-5" />
            </Link>
          </div>
        </div>
        {/* Mega-menu panels live outside the header row so each spans the full
            header width, the way the reference's static-positioned items do. */}
        {Object.entries(MEGA_MENUS).map(([label, content]) => (
          <MegaMenu
            key={label}
            id={menuId(label)}
            content={content}
            open={openMenu === label}
            onNavigate={() => setOpenMenu(null)}
          />
        ))}
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 wide:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/40"
            aria-label="Close navigation"
            tabIndex={-1}
            onClick={closeDrawer}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="text-ink absolute inset-y-0 left-0 flex w-[85%] max-w-[320px] flex-col overflow-y-auto bg-white"
          >
            <div className="border-hairline flex items-center justify-between border-b px-5 py-4">
              <span className="tracking-caps text-[13px] uppercase">Menu</span>
              <button
                ref={closeButton}
                type="button"
                onClick={closeDrawer}
                className="tracking-caps text-[13px] uppercase"
              >
                Close
              </button>
            </div>
            <ul className="list-none px-5 py-4">
              {ITEMS.map((item) => (
                <li key={item.label} className="py-1">
                  <Link
                    href={item.href}
                    className="block py-2 text-[16px]"
                    onClick={closeDrawer}
                  >
                    {item.label}
                  </Link>
                  {item.children ? (
                    <ul className="border-hairline mb-2 list-none border-l pl-4">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            className="text-ink/80 block py-1.5 text-[14px]"
                            onClick={closeDrawer}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
              <li className="border-hairline mt-2 border-t pt-3">
                <Link href="/search" className="block py-2 text-[16px]" onClick={closeDrawer}>
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </header>
  );
}
