import Image from "next/image";
import Link from "next/link";

export function HeroVideo() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#1d2a2e]"
      style={{ height: "var(--hero-height)" }}
      aria-label="Azadi Sale - 4th to 14th August - Flat 30% off"
    >
      <Image
        src="/onvor/azadi-promo-model.png"
        alt="Azadi Sale - 4th to 14th August - Flat 30% off"
        width={1672}
        height={941}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "70% 0%" }}
      />

      <div className="absolute inset-0 z-[3] flex items-end imp:items-center">
        <div className="page-width w-full">
          <div className="hero-text-shadow flex flex-col items-center pb-[28px] text-center text-white imp:items-start imp:pb-0 imp:pl-[24px] imp:text-left">
            <h2 className="font-heading max-w-[28rem] text-[36px] leading-[1.05] font-semibold imp:text-[64px]">
              Independence in every stitch.
            </h2>
            <p className="mt-4 max-w-[28rem] text-[15px] leading-relaxed opacity-90 imp:text-[19px]">
              Loose-fit tees and easy trousers. Pure cotton, cut to move.
            </p>
            <Link
              href="/collections/all-products"
              className="mt-6 inline-block rounded-full bg-white px-9 py-3.5 text-[12px] font-bold tracking-[0.18em] text-black uppercase shadow-md transition-all hover:bg-white/90 hover:shadow-lg active:scale-95"
            >
              Shop the sale
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
