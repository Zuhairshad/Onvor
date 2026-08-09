/**
 * Icons lifted verbatim from the Impulse theme's own SVG sprites — paths are
 * copied exactly so the glyphs match the reference rather than approximating
 * them with a different icon set.
 *
 * Two rendering modes, matching the theme's CSS:
 *  - UI icons (search, bag, socials…) are `fill: currentColor`.
 *  - The three `text-with-icons` glyphs (sparkle, cotton, heart) are outlined:
 *    add the `impulse-icon` class, which applies `fill:none` + a 4px stroke.
 */

type IconProps = {
  className?: string;
};

const base = {
  "aria-hidden": true,
  focusable: false as const,
  role: "presentation" as const,
};

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={4}>
      <path d="M47.16 28.58A18.58 18.58 0 1 1 28.58 10a18.58 18.58 0 0 1 18.58 18.58Z" />
      <path d="m54 54-12.85-12.85" />
    </svg>
  );
}

export function IconHamburger({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={4}>
      <path d="M7 15h50M7 32h50M7 49h50" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={4}>
      <path d="M35 39H29c-9.39 0-17 7.61-17 17v2h40v-2c0-9.39-7.61-17-17-17Z" />
      <circle cx="32" cy="20" r="14" />
    </svg>
  );
}

export function IconBag({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={4}>
      <path d="M13 18h38l3 40H10l3-40Z" />
      <path d="M22 26V14a10 10 0 0 1 20 0v12" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 28 16">
      <path d="m1.57 1.59 12.76 12.77L27.1 1.59" stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  );
}

export function IconEmail({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={4}>
      <path d="M63 52H1V12h62ZM1 12l25.68 24h9.72L63 12M21.82 31.68 1.56 51.16m60.78.78L41.27 31.68" />
    </svg>
  );
}

/* ---------- text-with-icons glyphs (use with the `impulse-icon` class) ------- */

export function IconSparkle({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 100 100">
      <path d="M23.896 30.268c7.289 0 13.198-5.94 13.198-13.268 0 7.328 5.909 13.268 13.198 13.268-7.29 0-13.198 5.94-13.198 13.268 0-7.328-5.91-13.268-13.198-13.268ZM15 72.271c6.443 0 11.667-5.25 11.667-11.728 0 6.477 5.223 11.728 11.666 11.728-6.443 0-11.666 5.251-11.666 11.729 0-6.478-5.224-11.729-11.667-11.729Zm28.438-16.2c11.477 0 20.78-9.353 20.78-20.892 0 11.539 9.305 20.892 20.782 20.892-11.477 0-20.781 9.354-20.781 20.892 0-11.538-9.304-20.892-20.781-20.892Z" />
    </svg>
  );
}

export function IconCotton({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 100 100">
      <path d="M50 82V66.516m0 0c-17.66 5.051-25.761-5.526-27.861-12.043M50 66.516a17.074 17.074 0 0 0-1.157-3.138c-1.927-4.012-5.85-8.56-12.469-10.24a19.532 19.532 0 0 0-2.585-.488M50 66.516c17.396 5.21 26.15-5.987 28.388-12.318M50 66.516c.222-.956.59-2.03 1.102-3.138 1.892-4.026 5.843-8.568 12.655-10.13h.007a18.86 18.86 0 0 1 2.343-.399m-43.968 1.624a18.624 18.624 0 0 1-.208-.688c4.58-1.294 8.51-1.562 11.858-1.135m-11.65 1.823C17.897 52.423 15 48.26 15 43.463c0-6.841 5.891-12.388 13.168-12.388 1.511 0 2.96.241 4.311.682m1.31 20.893c-1.809-3.469-2.848-7.557-2.848-11.94 0-3.18.547-6.208 1.538-8.953m45.937 22.372s-.014.048-.028.069m.028-.069c-4.79-1.376-8.864-1.693-12.31-1.28m12.31 1.28c-.007.02-.014.048-.028.069m0 0C82.338 52.065 85 48.053 85 43.462c0-6.84-5.898-12.387-13.168-12.387-1.511 0-2.96.241-4.311.682m-1.414 21.092c1.871-3.51 2.952-7.673 2.952-12.14 0-3.179-.547-6.207-1.538-8.952m-35.042 0C35.39 23.664 42.141 18 50 18c7.86 0 14.61 5.664 17.52 13.757" />
    </svg>
  );
}

export function IconHeart({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 100 100">
      <path d="M79.7 25.248c-7.057-6.991-18.504-6.991-25.562 0l-4.144 4.106-4.145-4.106c-7.057-6.998-18.498-6.998-25.556 0a17.79 17.79 0 0 0 0 25.323l4.145 4.106L50 80l25.562-25.323 4.145-4.106a17.79 17.79 0 0 0 0-25.323H79.7Z" />
    </svg>
  );
}

/* ------------------------------- socials ------------------------------------ */

export function IconInstagram({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 3.094c4.206 0 4.7.019 6.363.094 1.538.069 2.369.325 2.925.544.738.287 1.262.625 1.813 1.175s.894 1.075 1.175 1.813c.212.556.475 1.387.544 2.925.075 1.662.094 2.156.094 6.363s-.019 4.7-.094 6.363c-.069 1.538-.325 2.369-.544 2.925-.288.738-.625 1.262-1.175 1.813s-1.075.894-1.813 1.175c-.556.212-1.387.475-2.925.544-1.663.075-2.156.094-6.363.094s-4.7-.019-6.363-.094c-1.537-.069-2.369-.325-2.925-.544-.737-.288-1.263-.625-1.813-1.175s-.894-1.075-1.175-1.813c-.212-.556-.475-1.387-.544-2.925-.075-1.663-.094-2.156-.094-6.363s.019-4.7.094-6.363c.069-1.537.325-2.369.544-2.925.287-.737.625-1.263 1.175-1.813s1.075-.894 1.813-1.175c.556-.212 1.388-.475 2.925-.544 1.662-.081 2.156-.094 6.363-.094zm0-2.838c-4.275 0-4.813.019-6.494.094-1.675.075-2.819.344-3.819.731-1.037.4-1.913.944-2.788 1.819S1.486 4.656 1.08 5.688c-.387 1-.656 2.144-.731 3.825-.075 1.675-.094 2.213-.094 6.488s.019 4.813.094 6.494c.075 1.675.344 2.819.731 3.825.4 1.038.944 1.913 1.819 2.788s1.756 1.413 2.788 1.819c1 .387 2.144.656 3.825.731s2.213.094 6.494.094 4.813-.019 6.494-.094c1.675-.075 2.819-.344 3.825-.731 1.038-.4 1.913-.944 2.788-1.819s1.413-1.756 1.819-2.788c.387-1 .656-2.144.731-3.825s.094-2.212.094-6.494-.019-4.813-.094-6.494c-.075-1.675-.344-2.819-.731-3.825-.4-1.038-.944-1.913-1.819-2.788s-1.756-1.413-2.788-1.819c-1-.387-2.144-.656-3.825-.731C20.812.275 20.275.256 16 .256z" />
      <path d="M16 7.912a8.088 8.088 0 0 0 0 16.175c4.463 0 8.087-3.625 8.087-8.088s-3.625-8.088-8.088-8.088zm0 13.338a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 1 1 0 10.5zM26.294 7.594a1.887 1.887 0 1 1-3.774.002 1.887 1.887 0 0 1 3.774-.003z" />
    </svg>
  );
}

export function IconThreads({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M14.743 9.27a6.873 6.873 0 0 0-.262-.12c-.154-2.844-1.708-4.472-4.318-4.49h-.036c-1.56 0-2.859.667-3.658 1.88l1.435.984c.597-.905 1.534-1.098 2.224-1.098h.024c.86.005 1.508.255 1.927.742.306.355.51.845.611 1.464a10.98 10.98 0 0 0-2.467-.12c-2.48.144-4.076 1.59-3.969 3.602.054 1.02.563 1.897 1.43 2.47.735.485 1.68.722 2.663.668 1.298-.07 2.316-.566 3.026-1.471.54-.688.88-1.579 1.031-2.701.619.373 1.077.864 1.33 1.455.43 1.003.456 2.652-.89 3.997-1.18 1.178-2.596 1.688-4.738 1.703-2.376-.017-4.173-.78-5.342-2.264C3.67 14.58 3.105 12.57 3.084 10c.021-2.571.586-4.58 1.68-5.97 1.169-1.486 2.966-2.248 5.341-2.265 2.394.017 4.222.783 5.435 2.275.595.732 1.043 1.653 1.339 2.726l1.682-.45c-.358-1.32-.922-2.458-1.69-3.402C15.316 1.001 13.041.02 10.111 0H10.1C7.175.02 4.926 1.004 3.415 2.925c-1.344 1.709-2.037 4.087-2.06 7.068v.014c.023 2.98.716 5.359 2.06 7.068C4.926 18.995 7.175 19.98 10.1 20h.011c2.6-.018 4.433-.699 5.943-2.207 1.975-1.974 1.916-4.447 1.265-5.966-.467-1.089-1.358-1.973-2.576-2.557Zm-4.489 4.22c-1.087.062-2.217-.427-2.273-1.472-.041-.775.552-1.64 2.34-1.743.205-.012.406-.018.603-.018.65 0 1.257.063 1.81.184-.207 2.573-1.415 2.99-2.48 3.05Z" />
    </svg>
  );
}

export function IconFacebook({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 14222 14222" fill="currentColor">
      <path d="M14222 7112c0 3549.352-2600.418 6491.344-6000 7024.72V9168h1657l315-2056H8222V5778c0-562 275-1111 1159-1111h897V2917s-814-139-1592-139c-1624 0-2686 984-2686 2767v1567H4194v2056h1806v4968.72C2600.418 13603.344 0 10661.352 0 7112 0 3184.703 3183.703 1 7111 1s7111 3183.703 7111 7111Z" />
    </svg>
  );
}

export function IconYouTube({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 21 20" fill="currentColor">
      <path d="M-.196 15.803q0 1.23.812 2.092t1.977.861h14.946q1.165 0 1.977-.861t.812-2.092V3.909q0-1.23-.82-2.116T17.539.907H2.593q-1.148 0-1.969.886t-.82 2.116v11.894zm7.465-2.149V6.058q0-.115.066-.18.049-.016.082-.016l.082.016 7.153 3.806q.066.066.066.164 0 .066-.066.131l-7.153 3.806q-.033.033-.066.033-.066 0-.098-.033-.066-.066-.066-.131z" />
    </svg>
  );
}

export function IconPinterest({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M0 128.002c0 52.414 31.518 97.442 76.619 117.239-.36-8.938-.064-19.668 2.228-29.393 2.461-10.391 16.47-69.748 16.47-69.748s-4.089-8.173-4.089-20.252c0-18.969 10.994-33.136 24.686-33.136 11.643 0 17.268 8.745 17.268 19.217 0 11.704-7.465 29.211-11.304 45.426-3.207 13.578 6.808 24.653 20.203 24.653 24.252 0 40.586-31.149 40.586-68.055 0-28.054-18.895-49.052-53.262-49.052-38.828 0-63.017 28.956-63.017 61.3 0 11.152 3.288 19.016 8.438 25.106 2.368 2.797 2.697 3.922 1.84 7.134-.614 2.355-2.024 8.025-2.608 10.272-.852 3.242-3.479 4.401-6.409 3.204-17.884-7.301-26.213-26.886-26.213-48.902 0-36.361 30.666-79.961 91.482-79.961 48.87 0 81.035 35.364 81.035 73.325 0 50.213-27.916 87.726-69.066 87.726-13.819 0-26.818-7.47-31.271-15.955 0 0-7.431 29.492-9.005 35.187-2.714 9.869-8.026 19.733-12.883 27.421a127.897 127.897 0 0 0 36.277 5.249c70.684 0 127.996-57.309 127.996-128.005C256.001 57.309 198.689 0 128.005 0 57.314 0 0 57.309 0 128.002Z" />
    </svg>
  );
}

export function IconTikTok({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 2859 3333" fill="currentColor">
      <path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1932 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h551z" />
    </svg>
  );
}

/** Shoppable-hero hotspot marker, verbatim from the theme's icon-plus. */
export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.409 8.929h-6.695V2.258c0-.566-.506-1.029-1.071-1.029s-1.071.463-1.071 1.029v6.671H1.967C1.401 8.929.938 9.435.938 10s.463 1.071 1.029 1.071h6.605V17.7c0 .566.506 1.029 1.071 1.029s1.071-.463 1.071-1.029v-6.629h6.695c.566 0 1.029-.506 1.029-1.071s-.463-1.071-1.029-1.071z" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 284.49 498.98" fill="currentColor">
      <path d="M35 498.98a35 35 0 0 1-24.75-59.75l189.74-189.74L10.25 59.75a35.002 35.002 0 0 1 49.5-49.5l214.49 214.49a35 35 0 0 1 0 49.5L59.75 488.73A34.89 34.89 0 0 1 35 498.98Z" />
    </svg>
  );
}

/** Collection filter trigger. */
export function IconFilter({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  );
}

/* ------------------------- care-and-instruction glyphs ---------------------- */
/* Minimal outline pictograms for the PDP care panel — the shopper only needs
   to recognise the symbol, so a single 1.5px stroke is enough. */

const careProps = {
  ...base,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconWash({ className }: IconProps) {
  return (
    <svg {...careProps} className={className} viewBox="0 0 24 24">
      <path d="M3 5h18l-1.5 14a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 5Z" />
      <path d="M4 10c2 1 4 1 6-.5 2-1.5 6-1.5 8 0 1 .8 2 1 3 .5" />
    </svg>
  );
}

export function IconDoNotBleach({ className }: IconProps) {
  return (
    <svg {...careProps} className={className} viewBox="0 0 24 24">
      <path d="M4 20 12 4l8 16H4Z" />
      <path d="M5 5l14 14" />
    </svg>
  );
}

export function IconTumbleDry({ className }: IconProps) {
  return (
    <svg {...careProps} className={className} viewBox="0 0 24 24">
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDoNotIron({ className }: IconProps) {
  return (
    <svg {...careProps} className={className} viewBox="0 0 24 24">
      <path d="M3 16h18l-2-4a4 4 0 0 0-3.6-2.3H8.6A4 4 0 0 0 5 12l-2 4Z" />
      <path d="M3 19h18" />
      <path d="M5 5l14 14" />
    </svg>
  );
}

export function IconDoNotDryClean({ className }: IconProps) {
  return (
    <svg {...careProps} className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M6.3 6.3l11.4 11.4" />
    </svg>
  );
}

export function IconLikeColors({ className }: IconProps) {
  return (
    <svg {...careProps} className={className} viewBox="0 0 24 24">
      <circle cx="8.5" cy="12" r="4.5" />
      <circle cx="15.5" cy="12" r="4.5" />
    </svg>
  );
}

/* ------------------------- fabric-and-feel glyphs --------------------------- */

export function IconThread({ className }: IconProps) {
  return (
    <svg {...careProps} className={className} viewBox="0 0 24 24">
      <path d="M4 20c3-3 5-6 8-6s5 3 8 6" />
      <path d="M4 14c3-3 5-6 8-6s5 3 8 6" />
    </svg>
  );
}
