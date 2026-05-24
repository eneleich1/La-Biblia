"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FeaturedVerseCards } from "@/components/home/FeaturedVerseCards";
import { useSiteTheme } from "@/components/theme/ThemeProvider";

const HERO_IMAGES = [
  {
    src: "/images/bible-mountains-hero.png",
    alt: "Biblia abierta sobre madera con montanas al amanecer",
  },
  {
    src: "/images/hero/stained-glass-bible.png",
    alt: "Biblia abierta iluminada por vitrales",
  },
  {
    src: "/images/hero/river-chapel-bible.png",
    alt: "Biblia junto a un rio y capilla al amanecer",
  },
  {
    src: "/images/hero/altar-bible-chalice.png",
    alt: "Biblia abierta sobre altar con caliz",
  },
];

export function HomeHero() {
  const { heroImageIntervalMs } = useSiteTheme();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, heroImageIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [heroImageIntervalMs]);

  return (
    <section className="relative z-0 -mx-4 -mt-2 mb-4 min-h-[36rem] overflow-hidden sm:-mx-6 md:min-h-[38rem] lg:-mx-8 lg:min-h-[37rem] xl:-mx-12 xl:min-h-[35rem] 2xl:min-h-[33rem]">
      <div className="pointer-events-none absolute inset-0 bg-[var(--background)]" aria-hidden />

      <div
        className="home-hero-image pointer-events-none absolute bottom-0 left-0 top-0 right-4 sm:right-6 lg:right-8 xl:right-12"
        aria-hidden
      >
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image.src}
            className={`home-hero-image-layer ${index === heroIndex ? "is-active" : ""}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-contain object-right-bottom"
            />
          </div>
        ))}
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
          <h1 className="home-title-reveal page-title">
            Plataforma biblica cristiana
          </h1>
          <div
            className="home-accent-reveal mt-5 h-[3px] w-12 rounded-full bg-[var(--accent)] sm:w-16"
            aria-hidden
          />
          <p className="home-copy-reveal mt-5 max-w-[33rem] text-base font-medium leading-relaxed text-[var(--text)] sm:text-lg lg:mt-6 lg:leading-[1.6]">
            Un solo lugar para leer la Biblia, estudiar, buscar pasajes, escuchar ensenanzas y
            recursos de apologetica que fortalezcan tu fe y tu crecimiento espiritual cada dia.
          </p>
        </div>

        <FeaturedVerseCards className="mt-5 sm:mt-6 lg:mt-7" />
      </div>
    </section>
  );
}
