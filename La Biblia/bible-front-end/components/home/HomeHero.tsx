import Image from "next/image";
import { FeaturedVerseCards } from "@/components/home/FeaturedVerseCards";

const HERO_IMAGE = "/images/bible-mountains-hero.png";

export function HomeHero() {
  return (
    <section className="relative z-0 -mx-4 -mt-2 mb-4 min-h-[34rem] overflow-hidden sm:-mx-6 md:min-h-[35rem] lg:-mx-8 lg:min-h-[34rem] xl:-mx-12 xl:min-h-[32rem] 2xl:min-h-[30rem]">
      <div className="pointer-events-none absolute inset-0 bg-[var(--background)]" aria-hidden />

      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 right-4 sm:right-6 lg:right-8 xl:right-12"
        aria-hidden
      >
        <Image
          src={HERO_IMAGE}
          alt="Biblia abierta sobre madera con montañas al amanecer"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-contain object-right-bottom"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "var(--hero-image-wash)" }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--hero-scrim)" }}
        aria-hidden
      />

      <div className="relative z-10 w-full px-4 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 md:pb-12 md:pt-12 lg:px-16 lg:pt-6 xl:px-[4.25rem] xl:pt-8 2xl:pt-10">
        <div className="max-w-xl md:max-w-[31rem] lg:max-w-[45rem] xl:max-w-[52rem]">
          <h1 className="font-serif-display text-[2.65rem] font-semibold leading-[1.08] tracking-normal text-[var(--text)] sm:text-5xl lg:text-5xl xl:text-[3.25rem] 2xl:text-[3.55rem]">
            Plataforma bíblica cristiana
          </h1>
          <div
            className="mt-5 h-[3px] w-12 rounded-full bg-[var(--accent)] sm:w-16"
            aria-hidden
          />
          <p className="mt-5 max-w-[33rem] text-base font-medium leading-relaxed text-[var(--text)] sm:text-lg lg:mt-6 lg:leading-[1.6]">
            Un solo lugar para leer la Biblia, estudiar, buscar pasajes, escuchar enseñanzas y
            recursos de apologética que fortalezcan tu fe y tu crecimiento espiritual cada día.
          </p>
        </div>

        <FeaturedVerseCards className="mt-5 sm:mt-6 lg:mt-7" />
      </div>
    </section>
  );
}
