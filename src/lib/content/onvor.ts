/**
 * Onvor's real store content, scouted from https://theonvor.com (Shopify store
 * `jtszju-ha.myshopify.com`, currently on the Glamourin theme).
 *
 * This is the single source of truth for copy, navigation and merchandising
 * while the storefront is being rebuilt. The Impulse theme supplies the *design*;
 * everything a visitor reads should come from here, never from Impulse's demo
 * content.
 *
 * Once the Storefront API credentials are in place, the catalog-derived parts
 * (collections, featured products, prices) should be read live via
 * `src/lib/shopify/catalog.ts` — the shapes here deliberately mirror what those
 * functions return so the swap is mechanical. The brand copy stays here.
 */

export const BRAND = {
  name: "Onvor",
  /** Displayed exactly as the store writes it. */
  wordmark: "ONVOR",
  domain: "theonvor.com",
  currency: "PKR",
  country: "PK",
  locale: "en",
  logo: { src: "/onvor/logo.png", width: 400, height: 100 },
  /** Footer brand statement, verbatim. */
  statement:
    "We believe good clothes should be simple. ONVOR creates unisex basics that work from gym to life. Quality you can feel.",
  origin: "Made in Pakistan with care.",
  /** Their positioning line, used on the newsletter block. */
  positioning:
    "ONVOR doesn't believe in men's or women's clothing. We believe in clothing that simply works.",
  copyright: "All Right Reserved © 2024 The Onvor",
} as const;

/** Currently running promotion — check before reusing, it is seasonal. */
export const ANNOUNCEMENTS = [
  { bold: "Azadi Sale", rest: "Flat 30% off on all products" },
  { bold: "Free shipping", rest: "On all orders nationwide" },
] as const;

export const NEWSLETTER = {
  heading: "Get 10% Off Your First Order",
  body: "Subscribe & use code wearonvor at checkout for 10% off your first order. Join the ONVOR community — comfort for everyone.",
  code: "wearonvor",
  placeholder: "Your email address",
  footerHeading: "Subscribe to our emails",
} as const;

/**
 * Their three homepage value props. Note these are heading-only in the live
 * store — icon plus a short label, no body paragraph. The icons are their own
 * line drawings, not Impulse's.
 */
export const VALUE_PROPS = [
  { title: "100% Cotton", icon: "/onvor/icon-cotton.png" },
  { title: "Every Day", icon: "/onvor/icon-everyday.png" },
  { title: "Comfort", icon: "/onvor/icon-comfort.png" },
] as const;

/** Trust badges from their homepage. */
export const SERVICE_POINTS = [
  "Free Shipping",
  "100% Secure Payment",
  "24x7 Customer Service",
  "Free & Easy Returns",
] as const;

/**
 * Primary navigation, reconstructed from the live header.
 *
 * Onvor splits by gender first, then fit — the opposite emphasis to Impulse's
 * editorial menu, so do not carry Impulse's labels across.
 */
export const NAV = [
  {
    label: "Men",
    href: "/collections/men",
    children: [
      { label: "Loose Fit Tees", href: "/collections/oversized-tees-men" },
      { label: "Baggy Trouser", href: "/collections/baggy-trouser" },
      { label: "Straight Fit Trouser", href: "/collections/straight-fit-trouser" },
      { label: "Shorts", href: "/collections/shorts" },
    ],
  },
  {
    label: "Women",
    href: "/collections/women",
    children: [
      { label: "Loose Fit Tees", href: "/collections/oversized-tees-women" },
      { label: "Trousers", href: "/collections/trousers-women" },
    ],
  },
  {
    label: "Shop All",
    href: "/collections/all-products",
    children: [
      { label: "Loose Fit Tees", href: "/collections/oversized-tees" },
      { label: "Tops", href: "/collections/t-shirt" },
      { label: "Bottoms", href: "/collections/bottoms" },
      { label: "Pleated Trousers", href: "/collections/pleated-trousers" },
    ],
  },
  { label: "Size Guide", href: "/pages/size-guide" },
  { label: "Contact", href: "/pages/contact" },
] as const;

/**
 * All 14 collections that exist on the store, with live product counts.
 * Useful when a reference design shows N tiles and we need to know how many we
 * actually have to fill them with.
 */
export const COLLECTIONS = [
  { handle: "all-products", title: "All Products", count: 65 },
  { handle: "frontpage", title: "Home page", count: 60 },
  { handle: "men", title: "Men", count: 47 },
  { handle: "oversized-tees", title: "Loose Fit Tees", count: 33 },
  { handle: "t-shirt", title: "Tops", count: 33 },
  { handle: "bottoms", title: "Bottoms", count: 27 },
  { handle: "oversized-tees-men", title: "Loose Fit Tees - Men", count: 24 },
  { handle: "women", title: "Women", count: 14 },
  { handle: "baggy-trouser", title: "Baggy Trouser", count: 11 },
  { handle: "oversized-tees-women", title: "Loose Fit Tees - Women", count: 10 },
  { handle: "straight-fit-trouser", title: "Straight Fit Trouser", count: 8 },
  { handle: "shorts", title: "Shorts", count: 6 },
  { handle: "trousers-women", title: "Trousers - Women", count: 3 },
  { handle: "pleated-trousers", title: "Pleated Trousers", count: 2 },
] as const;

/**
 * The two category tiles the live store leads with. Onvor merchandises by
 * gender, so a reference design's editorial tiles ("The Linen Edit", "Soft
 * Neutrals") map onto these plus fit-based collections — not one-to-one.
 */
export const CATEGORY_TILES = [
  {
    label: "Men",
    href: "/collections/men",
    src: "/onvor/tile-men.jpg",
    width: 1400,
    height: 548,
  },
  {
    label: "Women",
    href: "/collections/women",
    src: "/onvor/tile-women.jpg",
    width: 1400,
    height: 548,
  },
] as const;

/** Fit-based tiles, to fill a grid that needs more than the two gender tiles. */
export const FIT_TILES = [
  { label: "Loose Fit Tees", href: "/collections/oversized-tees" },
  { label: "Baggy Trouser", href: "/collections/baggy-trouser" },
  { label: "Straight Fit Trouser", href: "/collections/straight-fit-trouser" },
  { label: "Shorts", href: "/collections/shorts" },
] as const;

/** Editorial / lifestyle photography available for hero and feature rows. */
export const IMAGERY = {
  heroBanner: { src: "/onvor/hero-banner.jpg", width: 1250, height: 1718 },
  lifestyle: [
    { src: "/onvor/lifestyle-1.jpg", width: 1000, height: 1500 },
    { src: "/onvor/lifestyle-2.jpg", width: 1000, height: 1500 },
    { src: "/onvor/lifestyle-3.jpg", width: 1000, height: 1500 },
  ],
} as const;

/**
 * The five products their live homepage features under "BEST SELLING".
 * Prices are PKR and were correct at scouting time — treat them as placeholders
 * and read live prices from the Storefront API before shipping.
 */
export const FEATURED_PRODUCTS = [
  {
    handle: "signature-straight-fit-black",
    title: "Signature Straight Fit - Black",
    price: "2379.30",
  },
  {
    handle: "urdu-calligraphy-tee-white",
    title: "Urdu Calligraphy Tee - White",
    price: "1679.30",
  },
  { handle: "stamp-shorts-grey", title: "Stamp Shorts - Grey", price: "1959.30" },
  {
    handle: "signature-tee-steel-grey",
    title: "Signature Tee - Steel Grey",
    price: "1679.30",
  },
  { handle: "stamp-rainbow-tee", title: "Stamp Rainbow Tee", price: "1679.30" },
] as const;

/** Section headings the live homepage uses, so ours read the same. */
export const SECTION_HEADINGS = {
  bestSelling: "Best Selling",
  looseFitTee: "Loose Fit Tee",
  newArrivals: "New Arrivals",
} as const;

/** Variant options in use across the catalog. */
export const VARIANTS = {
  sizes: ["S", "M", "L", "XL"],
  colors: [
    "Beige",
    "Black",
    "Blue",
    "Charcoal",
    "Cream",
    "Grey",
    "Navy",
    "Olive",
    "Olive Green",
    "White",
  ],
} as const;

export const FOOTER_MENUS = [
  {
    title: "Shop",
    links: [
      { label: "Men", href: "/collections/men" },
      { label: "Women", href: "/collections/women" },
      { label: "Loose Fit Tees", href: "/collections/oversized-tees" },
      { label: "Baggy Trouser", href: "/collections/baggy-trouser" },
      { label: "Shorts", href: "/collections/shorts" },
      { label: "All Products", href: "/collections/all-products" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Information", href: "/policies/contact-information" },
      { label: "Privacy Policy", href: "/policies/privacy-policy" },
      { label: "Refund Policy", href: "/policies/refund-policy" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: "/pages/contact" },
      { label: "Size Guide", href: "/pages/size-guide" },
    ],
  },
] as const;

/** Only two channels are live — do not pad this out with unused networks. */
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/theonvor/" },
  { label: "Facebook", href: "https://www.facebook.com/wearonvor" },
] as const;

/**
 * Mega-menu structure for the header.
 *
 * The reference theme runs two mega-menu shapes: image-topped category columns,
 * and text columns alongside arch-topped promo cards. Both are used here.
 *
 * Onvor's catalog is shallower than the reference's — 14 collections against its
 * editorial sprawl — so columns carry two to five links rather than being padded
 * out with invented categories. Menu images reuse product shots, since their
 * collections have no collection images and their two banners have SUMMER'26
 * burnt into the artwork.
 */
export type MegaColumn = {
  heading: string;
  headingHref?: string;
  image?: string;
  links: { label: string; href: string }[];
};

export type MegaPromo = {
  heading: string;
  text?: string;
  cta?: string;
  href: string;
  image: string;
};

export type MegaMenuContent = {
  columns: MegaColumn[];
  promos?: MegaPromo[];
};

export const MEGA_MENUS: Record<string, MegaMenuContent> = {
  Men: {
    columns: [
      {
        heading: "Tops",
        headingHref: "/collections/oversized-tees-men",
        image: "/onvor/products/signature-tee-steel-grey-1.jpg",
        links: [
          { label: "Loose Fit Tees", href: "/collections/oversized-tees-men" },
          { label: "All Tops", href: "/collections/t-shirt" },
        ],
      },
      {
        heading: "Bottoms",
        headingHref: "/collections/bottoms",
        image: "/onvor/products/signature-straight-fit-black-1.jpg",
        links: [
          { label: "Baggy Trouser", href: "/collections/baggy-trouser" },
          { label: "Straight Fit Trouser", href: "/collections/straight-fit-trouser" },
          { label: "Pleated Trousers", href: "/collections/pleated-trousers" },
          { label: "All Bottoms", href: "/collections/bottoms" },
        ],
      },
      {
        heading: "Shorts",
        headingHref: "/collections/shorts",
        image: "/onvor/products/stamp-shorts-grey-1.jpg",
        links: [{ label: "Shop Shorts", href: "/collections/shorts" }],
      },
    ],
    promos: [
      {
        heading: "Shop Men",
        text: "Unisex basics cut for an easy, relaxed fit.",
        href: "/collections/men",
        image: "/onvor/products/refined-loose-fit-tee-black-1.jpg",
      },
    ],
  },

  Women: {
    columns: [
      {
        heading: "Tops",
        headingHref: "/collections/oversized-tees-women",
        image: "/onvor/products/urdu-calligraphy-tee-white-1.jpg",
        links: [
          { label: "Loose Fit Tees", href: "/collections/oversized-tees-women" },
          { label: "All Tops", href: "/collections/t-shirt" },
        ],
      },
      {
        heading: "Bottoms",
        headingHref: "/collections/trousers-women",
        image: "/onvor/products/signature-straight-fit-black-2.jpg",
        links: [
          { label: "Trousers", href: "/collections/trousers-women" },
          { label: "All Bottoms", href: "/collections/bottoms" },
        ],
      },
    ],
    promos: [
      {
        heading: "Shop Women",
        text: "The same cotton basics, cut to the same easy fit.",
        href: "/collections/women",
        image: "/onvor/products/stamp-rainbow-tee-1.jpg",
      },
    ],
  },

  "Shop All": {
    columns: [
      {
        heading: "Featured",
        headingHref: "/collections/all-products",
        links: [
          { label: "All Products", href: "/collections/all-products" },
          { label: "Men", href: "/collections/men" },
          { label: "Women", href: "/collections/women" },
        ],
      },
      {
        heading: "Shop by category",
        links: [
          { label: "Tops", href: "/collections/t-shirt" },
          { label: "Bottoms", href: "/collections/bottoms" },
          { label: "Shorts", href: "/collections/shorts" },
        ],
      },
      {
        heading: "Shop by fit",
        links: [
          { label: "Loose Fit Tees", href: "/collections/oversized-tees" },
          { label: "Baggy Trouser", href: "/collections/baggy-trouser" },
          { label: "Straight Fit Trouser", href: "/collections/straight-fit-trouser" },
          { label: "Pleated Trousers", href: "/collections/pleated-trousers" },
        ],
      },
    ],
    promos: [
      {
        heading: "Loose Fit Tees",
        text: "100% cotton, built to keep their shape.",
        href: "/collections/oversized-tees",
        image: "/onvor/products/stamp-tee-white-1.jpg",
      },
      {
        heading: "New in bottoms",
        cta: "Shop bottoms",
        href: "/collections/bottoms",
        image: "/onvor/products/signature-shorts-charcoal-1.jpg",
      },
    ],
  },
};
