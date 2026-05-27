"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Clock,
  Download,
  ListTree,
} from "lucide-react";
import { getGuideSectionIcon } from "@/lib/apologeticaGuideIcons";
import type { ApologeticaGuidePageData } from "@/lib/parseApologeticaGuide";

type Props = {
  guide: ApologeticaGuidePageData;
};

function HeroIllustration() {
  return (
    <div className="relative h-full min-h-[7rem] w-full overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/apologetica/hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f7f1e8]/90 via-[#f7f1e8]/45 to-transparent" />
    </div>
  );
}

function SectionQuote({ text, reference }: { text: string; reference: string }) {
  return (
    <aside className="guide-section-quote hidden w-full max-w-[19rem] shrink-0 border-l border-[var(--accent)]/35 pl-5 xl:block">
      <span
        className="font-serif-display text-4xl leading-none text-[var(--accent)]/55"
        aria-hidden
      >
        &ldquo;
      </span>
      <p className="-mt-3 text-[13px] leading-relaxed text-[var(--text)]/80">{text}</p>
      <p className="mt-2 text-xs font-semibold text-[var(--accent)]">{reference}</p>
    </aside>
  );
}

function GuideSidebar({
  guide,
  activeSectionId,
  progress,
  onSelectSection,
}: {
  guide: ApologeticaGuidePageData;
  activeSectionId: string;
  progress: number;
  onSelectSection: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div>
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} aria-hidden />
          <h2 className="text-sm font-semibold text-[var(--text)]">En esta guía</h2>
        </div>
        <nav className="mt-4" aria-label="Secciones de la guía">
          <ul className="relative space-y-1 pl-2 before:absolute before:bottom-3 before:left-[0.44rem] before:top-3 before:w-px before:bg-[var(--border)]">
            {guide.sections.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(section.id)}
                    className={`relative flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-[13px] leading-snug transition ${
                      isActive
                        ? "font-semibold text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--background-soft)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border bg-[var(--surface)] ${
                        isActive
                          ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
                          : "border-[var(--accent)]/45"
                      }`}
                      aria-hidden
                    />
                    <span>{section.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-5 border-t border-[var(--border)] pt-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
          <p className="font-serif-display text-base font-semibold text-[var(--text)]">
            Tu lectura
          </p>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">{progress}% completado</p>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-soft)]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
          Tiempo estimado: {guide.readingMinutes} min
        </p>
      </div>
    </div>
  );
}

function KeyPassages({ guide }: { guide: ApologeticaGuidePageData }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
        <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
          Pasajes clave
        </h3>
      </div>
      <ul className="mt-4 space-y-3.5">
        {guide.keyPassages.map((passage) => (
          <li key={passage.href}>
            <Link
              href={passage.href}
              className="group flex gap-3 rounded-md py-0.5 transition hover:bg-[var(--background-soft)] no-underline"
            >
              <BookOpen
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]"
                strokeWidth={1.65}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-[var(--accent)] group-hover:underline">
                  {passage.reference}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-[var(--text-muted)]">
                  {passage.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DownloadGuide() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
        <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
          Descargar guía
        </h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        Guía completa en PDF. Para estudio y referencia personal.
      </p>
      <button
        type="button"
        disabled
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--accent)]/55 bg-transparent px-4 py-2 text-sm font-semibold text-[var(--accent)] opacity-70"
        title="Próximamente"
      >
        Descargar PDF
        <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}

export function ApologeticaGuidePage({ guide }: Props) {
  const [activeSectionId, setActiveSectionId] = useState(guide.sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      setProgress(0);
      return;
    }
    setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    const elements = guide.sections
      .map((s) => sectionRefs.current[s.id])
      .filter((el): el is HTMLElement => el != null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveSectionId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.2, 0.45, 0.7] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [guide.sections]);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSectionId(id);
  };

  return (
    <div className="apologetica-guide mx-auto w-full max-w-[1640px] pb-8">
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition hover:text-[var(--accent)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li>
            <Link href="/apologetica" className="transition hover:text-[var(--accent)]">
              Apologética
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li className="text-[var(--text-muted)]">Guías bíblicas</li>
        </ol>
      </nav>

      <Link
        href="/apologetica"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Volver a guías bíblicas
      </Link>

      <header className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,34rem)] lg:items-start lg:gap-12">
        <div className="flex min-w-0 flex-col space-y-2 pt-0 lg:pr-4">
          <h1 className="page-title">{guide.title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            {guide.description}
          </p>
        </div>

        <div className="guide-hero-quote flex h-[10rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[#f7f1e8] shadow-[var(--shadow-card)] sm:h-[11.25rem]">
          <div className="flex min-w-0 flex-1 flex-col justify-center px-7 py-5">
            <span className="font-serif-display text-5xl leading-none text-[var(--accent)]/35" aria-hidden>
              &ldquo;
            </span>
            <p className="-mt-2 text-base font-semibold leading-tight text-[var(--accent)]">
              {guide.heroQuote.reference}
            </p>
            <p className="mt-2 line-clamp-3 font-serif-display text-[15px] leading-relaxed text-[var(--text)] sm:text-[17px]">
              {guide.heroQuote.text}
            </p>
          </div>
          <div className="hidden w-[43%] min-w-[13.5rem] shrink-0 self-stretch sm:block">
            <HeroIllustration />
          </div>
        </div>
      </header>

      <div className="mt-8 lg:hidden">
        <GuideSidebar
          guide={guide}
          activeSectionId={activeSectionId}
          progress={progress}
          onSelectSection={scrollToSection}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[18rem_minmax(0,1fr)_15rem] xl:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <GuideSidebar
              guide={guide}
              activeSectionId={activeSectionId}
              progress={progress}
              onSelectSection={scrollToSection}
            />
          </div>
        </aside>

        <main className="min-w-0">
          <ol className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            {guide.sections.map((section, index) => {
              const Icon = getGuideSectionIcon(section.icon);
              return (
                <li
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  className={`scroll-mt-28 px-5 py-5 sm:px-7 sm:py-5 ${
                    index < guide.sections.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <article>
                    <div className="grid gap-5 sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:items-start xl:grid-cols-[4.5rem_minmax(0,1fr)_21rem]">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--background-soft)] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] sm:h-16 sm:w-16">
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.45} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-serif-display text-xl font-semibold leading-snug text-[var(--text)] sm:text-[1.65rem]">
                          {section.number}. {section.title}
                        </h2>

                        {section.tags.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {section.tags.map((tag) => (
                              <Link
                                key={tag.href}
                                href={tag.href}
                                className="inline-flex rounded-full border border-[var(--accent)]/35 bg-transparent px-3 py-0.5 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/55 hover:bg-[var(--accent-soft)] no-underline"
                              >
                                {tag.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        <p className="mt-3 text-[15px] leading-relaxed text-[var(--text)]/90">
                          {section.body}
                        </p>
                      </div>

                      {section.quote ? (
                        <SectionQuote
                          text={section.quote.text}
                          reference={section.quote.reference}
                        />
                      ) : (
                        <span className="hidden xl:block" />
                      )}
                    </div>

                    {section.quote ? (
                      <blockquote className="guide-section-quote mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-soft)] px-4 py-3.5 xl:hidden sm:ml-[5.5rem]">
                        <span
                          className="font-serif-display text-3xl leading-none text-[var(--accent)]/40"
                          aria-hidden
                        >
                          &ldquo;
                        </span>
                        <p className="-mt-2 text-sm leading-relaxed text-[var(--text)]">
                          {section.quote.text}
                        </p>
                        <footer className="mt-2 text-xs font-semibold text-[var(--accent)]">
                          {section.quote.reference}
                        </footer>
                      </blockquote>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        </main>

        <aside className="min-w-0 space-y-4 lg:col-span-2 xl:col-span-1">
          <div className="lg:sticky lg:top-24 lg:space-y-4">
            <KeyPassages guide={guide} />
            <DownloadGuide />
          </div>
        </aside>
      </div>
    </div>
  );
}
