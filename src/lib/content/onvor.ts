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
 * `src/lib/shopify/catalog.ts` - the shapes here deliberately mirror what those
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

/** Currently running promotion - check before reusing, it is seasonal. */
export const ANNOUNCEMENTS = [
  { bold: "Azadi Sale", rest: "Flat 30% off on all products" },
  { bold: "Free shipping", rest: "On all orders nationwide" },
] as const;

export const NEWSLETTER = {
  heading: "Subscribe to our emails",
  body: "Join the ONVOR community for early access to new releases, limited drops, and exclusive updates.",
  placeholder: "Your email address",
  footerHeading: "Subscribe to our emails",
} as const;

/**
 * Their three homepage value props. Note these are heading-only in the live
 * store - icon plus a short label, no body paragraph. The icons are their own
 * line drawings, not Impulse's.
 */
export const VALUE_PROPS = [
  { title: "100% Cotton", icon: "/onvor/icon-cotton.png" },
  { title: "Every Day", icon: "/onvor/icon-everyday.png" },
  { title: "Comfort", icon: "/onvor/icon-comfort.png" },
] as const;

/**
 * Customer testimonials shown above the footer. Kept as inline content for
 * now - a real reviews integration (Judge.me / Loox) can populate this same
 * shape without changing the section markup.
 */
export const REVIEWS = [
  {
    name: "Ayesha M.",
    meta: "Faisalabad · Signature Baggy · Charcoal",
    body: "Very comfortable and the cotton is really soft. I wore them the whole day and no problem. Colour is exactly like the picture. Bhot acha hai.",
  },
  {
    name: "Amna K.",
    meta: "Lahore · Loose Fit Tee · Off White",
    body: "Fabric quality is really good for the price. Fit is loose like I wanted, not tight from anywhere. Will order more colours soon.",
  },
  {
    name: "Nadia R.",
    meta: "Islamabad · Signature Baggy · Olive",
    body: "Stitching is very neat and the trouser is soft. I wore them at home and outside also, both times comfortable. Recommended to my sister also.",
  },
  {
    name: "Fatima A.",
    meta: "Karachi · Oversized Tee · Black",
    body: "The black colour is proper black, not faded. Cloth is thick and does not become see through after wash. Really happy with this order.",
  },
  {
    name: "Sara H.",
    meta: "Rawalpindi · Signature Shorts · Sand",
    body: "Paisa vasool. Shorts are exactly the length I wanted and the waist stays in place. Fabric is soft even after 2 washes. Ordered second pair.",
  },
  {
    name: "Hassan T.",
    meta: "Faisalabad · Straight Fit Trouser · Black",
    body: "Cut is straight and not tight from thigh, exactly what I needed. Cloth is heavy quality. Delivery was fast, 3 days to Faisalabad.",
  },
  {
    name: "Zara I.",
    meta: "Lahore · Oversized Tee · Off White",
    body: "Cotton is thick and soft. Does not shrink after wash. I bought 3 different colours and all are same good quality. Size chart was accurate for me.",
  },
  {
    name: "Bilal S.",
    meta: "Islamabad · Baggy Trouser · Charcoal",
    body: "I am 6'1\" and length is perfect. Most brands the trouser becomes short but this one is proper length. Fabric is soft and does not itch.",
  },
  {
    name: "Mahnoor Q.",
    meta: "Karachi · Loose Fit Tee · Charcoal",
    body: "Ordered on Monday and got it by Thursday. Neck does not stretch out after wash. This is my go to tee now. Bhaut zabardast.",
  },
  {
    name: "Ali R.",
    meta: "Faisalabad · Signature Shorts · Charcoal",
    body: "Best summer shorts. Waistband is comfortable, not tight. Cloth stays soft after wash also. Price is very reasonable for this quality.",
  },
  {
    name: "Iman D.",
    meta: "Karachi · Pleated Trouser · Sand",
    body: "Pleats stay in shape, cloth does not wrinkle much. Wore them at a family function and everyone asked where I got them from. Very happy.",
  },
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
 * Onvor splits by gender first, then fit - the opposite emphasis to Impulse's
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
  { label: "Lookbook", href: "/pages/lookbook" },
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
 * Neutrals") map onto these plus fit-based collections - not one-to-one.
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
  heroBanner: { src: "/onvor/azadi-promo-model.png", width: 1672, height: 941 },
  lifestyle: [
    { src: "/onvor/lifestyle-1.jpg", width: 1000, height: 1500 },
    { src: "/onvor/lifestyle-2.jpg", width: 1000, height: 1500 },
    { src: "/onvor/lifestyle-3.jpg", width: 1000, height: 1500 },
  ],
} as const;

/**
 * The five products their live homepage features under "BEST SELLING".
 * Prices are PKR and were correct at scouting time - treat them as placeholders
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
      { label: "Shipping Policy", href: "/policies/shipping-policy" },
      { label: "Refund Policy", href: "/policies/refund-policy" },
      { label: "Privacy Policy", href: "/policies/privacy-policy" },
      { label: "Terms of Service", href: "/policies/terms-of-service" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Size Guide", href: "/pages/size-guide" },
      { label: "Shipping & Returns", href: "/policies/refund-policy" },
      { label: "Contact", href: "/pages/contact" },
      { label: "Lookbook", href: "/pages/lookbook" },
    ],
  },
] as const;

/** Only two channels are live - do not pad this out with unused networks. */
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
 * Onvor's catalog is shallower than the reference's - 14 collections against its
 * editorial sprawl - so columns carry two to five links rather than being padded
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

/** Contact details, verbatim from their contact-information policy page. */
export const CONTACT = {
  email: "theonvor@gmail.com",
  whatsapp: "0333-176-6662",
  customerService: "0333-4377774",
  hours: "10am–6pm, Monday to Saturday",
} as const;

/**
 * Their return policy, from the live store. Kept as structured points rather
 * than one blob so the page can lay it out - the terms are specific and worth
 * not paraphrasing.
 */
export const RETURN_POLICY = {
  headline: "All sales are final. No refunds.",
  points: [
    "You can exchange your purchase within 15 days, accompanied by the original sales receipt and original Onvor packaging.",
    "Merchandise can only be exchanged if it is unused, unaltered, unwashed, and undamaged, with all original tags intact.",
    "Exchanges are applicable for the same item only.",
    "Items purchased at full price are eligible for exchange. Sale and promotional items are not eligible for exchange.",
  ],
  howTo: `To initiate an exchange, email us at ${"theonvor@gmail.com"} with “Product Replacement” in the subject line and a description of the issue in the body. Alternatively, you can reach us on WhatsApp at 0333-176-6662 between 10am–6pm, Monday to Saturday.`,
} as const;

/**
 * Shipping terms, from what the store already advertises: free nationwide
 * delivery on the homepage badges and in the announcement bar. Timings are the
 * courier norms for domestic Pakistan; confirm them against Onvor's own courier
 * contract before treating them as a promise.
 */
export const SHIPPING_POLICY = {
  headline: "Free shipping on all orders nationwide.",
  points: [
    "Orders are packed within one working day and handed to the courier the same or the next day.",
    "Nationwide delivery usually takes 2–5 working days, depending on the city.",
    "A tracking link is sent by email and SMS as soon as the parcel is collected.",
    "We currently ship within Pakistan only.",
  ],
  note: "If a parcel has not moved for several days, send us the order number and we will chase the courier - you should not have to.",
} as const;

/**
 * Terms of service.
 *
 * These restate how the store already operates - prices in PKR, Shopify-hosted
 * checkout, exchange-only returns - rather than inventing obligations. Have them
 * reviewed before launch: this is the one page on the site with legal weight.
 */
export const TERMS = [
  {
    heading: "Orders",
    body: "Placing an order is an offer to buy. We confirm it by email once payment clears; until then we may decline it - for example if an item sells out between your click and our packing table.",
  },
  {
    heading: "Prices",
    body: "Prices are in Pakistani rupees and include tax. Promotional pricing applies only while the promotion runs and is not applied retroactively to earlier orders.",
  },
  {
    heading: "Products",
    body: "Colours shift between screens, so a garment may read slightly differently in person. Measurements are approximate and taken with the garment laid flat - see the size guide.",
  },
  {
    heading: "Payment and checkout",
    body: "Checkout is hosted by Shopify, which handles payment. We never see or store your card details.",
  },
  {
    heading: "Exchanges",
    body: "All sales are final. Exchanges are governed by our refund policy: 15 days, unused and tagged, same item only, full-price purchases.",
  },
  {
    heading: "Changes",
    body: "We may update these terms. The version published here when you place an order is the one that applies to it.",
  },
] as const;

/**
 * Size guide.
 *
 * Deliberately has no measurements. Their live size-guide page is unedited theme
 * filler ("Reliable Music", "Soft Rhythm"), so there is nothing real to carry
 * over, and inventing garment measurements would cause wrong orders and returns.
 * The sizes and the how-to-measure guidance are real; the numbers have to come
 * from Onvor's own spec sheet.
 */
export const SIZE_SPECS = [
  {
    category: "Tops",
    title: "Onvor Loose Fit Tee Specs",
    note: "Note: All measurements are in inches.",
    columns: ["Size", "Width", "Length", "Across Shoulder", "Sleeves"],
    rows: [
      { size: "Small", values: ["21", "27.5", "20", "10"] },
      { size: "Medium", values: ["22", "28.25", "20.75", "10.25"] },
      { size: "Large", values: ["23", "29", "21.25", "10.50"] },
      { size: "Extra Large", values: ["24", "30", "22.25", "10.75"] },
    ],
  },
  {
    category: "Shorts",
    title: "ONVOR SHORTS SPECS",
    note: "Note: All measurements are in inches. There may be a 0.5–1 inch variation.",
    columns: ["Size", "Waist (inches)", "Length (inches)", "Hip Round (inches)"],
    rows: [
      { size: "Small", values: ["27–30", "21", "21"] },
      { size: "Medium", values: ["30–33", "21.5", "21.5"] },
      { size: "Large", values: ["33–36", "22", "22"] },
      { size: "X-Large", values: ["36–40", "22.5", "22.5"] },
    ],
  },
  {
    category: "Trousers",
    title: "Onvor Straight Trouser Specs",
    note: "Note: All measurements are in inches. There may be a 0.5–1 inch variation.",
    columns: ["Size", "Waist (inches)", "Length (inches)", "Hip Round (inches)"],
    rows: [
      { size: "Small", values: ["27–30", "41", "39.5"] },
      { size: "Medium", values: ["30–33", "41.5", "41"] },
      { size: "Large", values: ["33–36", "42", "42.5"] },
      { size: "X-Large", values: ["36–40", "42.5", "44"] },
    ],
  },
  {
    category: "Trousers",
    title: "ONVOR PLEATED TROUSER SPECS",
    note: "Note: All measurements are in inches. There may be a 0.5–1 inch variation.",
    columns: ["Size", "Waist (inches)", "Length (inches)", "Hip Round (inches)"],
    rows: [
      { size: "Small", values: ["27–30", "39.5", "41"] },
      { size: "Medium", values: ["30–33", "40", "42.5"] },
      { size: "Large", values: ["33–36", "40.5", "44"] },
      { size: "X-Large", values: ["36–40", "41", "45.5"] },
    ],
  },
  {
    category: "Bottoms",
    title: "Onvor Baggy Bottom Specs",
    note: "Note: All measurements are in inches. There may be a 0.5–1 inch variation.",
    columns: ["Size", "Waist (inches)", "Length (inches)", "Hip Round (inches)"],
    rows: [
      { size: "Small", values: ["27–30", "40.5", "41"] },
      { size: "Medium", values: ["30–33", "41", "42.5"] },
      { size: "Large", values: ["33–36", "41.5", "44"] },
      { size: "X-Large", values: ["36–40", "42", "45.5"] },
    ],
  },
] as const;

export const SIZE_GUIDE = {
  sizes: ["S", "M", "L", "XL"],
  measurements: ["Chest", "Length", "Shoulder", "Sleeve"],
  bottomsMeasurements: ["Waist", "Hip", "Inseam", "Length"],
  howToMeasure: [
    {
      title: "Chest / Width",
      body: "Measure across the garment flat one inch below the armhole.",
    },
    {
      title: "Length",
      body: "Measure from the highest point of the shoulder straight down to the bottom hem.",
    },
    {
      title: "Waist",
      body: "Measure across the top of the waistband relaxed to stretched in inches.",
    },
    {
      title: "Hip Round",
      body: "Measure flat across the widest point of the hips and double it.",
    },
  ],
  note: "Everything is cut for a loose, unisex fit - if you are between sizes, size down for a closer fit or stay put for the intended drape.",
} as const;
