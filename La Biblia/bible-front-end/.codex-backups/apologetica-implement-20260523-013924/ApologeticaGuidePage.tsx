"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Church,
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
    <div
      className="relative flex h-[4.25rem] w-[12.5rem] shrink-0 items-center justify-center sm:h-[4.5rem] sm:w-[14rem]"
      aria-hidden
    >
      <div className="absolute inset-x-1 inset-y-2 rounded-full bg-[var(--accent)]/8 blur-md" />
      <div className="relative flex items-center justify-center gap-2 sm:gap-2.5">
        <div className="flex h-[3.35rem] w-[4.75rem] flex-col items-center justify-end rounded-md border border-[var(--accent)]/20 bg-[var(--surface)]/90 px-2 pb-1.5 shadow-sm sm:h-[3.5rem] sm:w-[5.25rem]">
          <BookOpen className="h-6 w-6 text-[var(--accent)]/85 sm:h-[1.65rem] sm:w-[1.65rem]" strokeWidth={1.25} />
          <div className="mt-0.5 h-0.5 w-full rounded-full bg-[var(--accent)]/15" />
          <div className="mt-0.5 h-0.5 w-4/5 rounded-full bg-[var(--accent)]/10" />
        </div>
        <div className="flex h-[3.85rem] w-[5.5rem] flex-col items-center justify-center rounded-md border border-[var(--accent)]/25 bg-[var(--surface)]/95 shadow-sm sm:h-[4rem] sm:w-[6rem]">
          <Church className="h-7 w-7 text-[var(--accent)]/90 sm:h-8 sm:w-8" strokeWidth={1.2} />
        </div>
      </div>
    </div>
  );
}

function SectionQuote({ text, reference }: { text: string; reference: string }) {
  return (
    <aside className="guide-section-quote hidden w-full max-w-[17.5rem] shrink-0 lg:block xl:max-w-[19rem]">
      <span
        className="font-serif-display text-4xl leading-none text-[var(--accent)]/40"
        aria-hidden
      >
        “
      </span>
      <p className="-mt-3 border-l-2 border-[var(--accent)]/35 pl-3 text-sm italic leading-relaxed text-[var(--text)]">
        {text}
      </p>
      <p className="mt-2 pl-3 text-xs font-semibold text-[var(--accent)]">{reference}</p>
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
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <ListTree className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} aria-hidden />
          <h2 className="text-sm font-semibold text-[var(--text)]">En esta guía</h2>
        </div>
        <nav className="mt-3" aria-label="Secciones de la guía">
          <ul className="space-y-0.5">
            {guide.sections.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(section.id)}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] leading-snug transition ${
                      isActive
                        ? "bg-[var(--accent-soft)] font-semibold text-[var(--text)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--background-soft)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        isActive ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                      }`}
                      aria-hidden
                    />
                    <span>
                      {section.number}. {section.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Tu lectura
        </p>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--background-soft)]"
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
        <p className="mt-2 text-xs text-[var(--text-muted)]">{progress}% completado</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Clock className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} aria-hidden />
          Tiempo estimado: {guide.readingMinutes} min
        </p>
      </div>
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
    <div className="apologetica-guide mx-auto w-full max-w-[82rem] pb-12">
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
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Volver a guías bíblicas
      </Link>

      <header className="mt-2 grid gap-4 lg:mt-3 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,28rem)] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col space-y-2 pt-0 lg:pr-4">
          <h1 className="font-serif-display text-[2.15rem] font-semibold leading-[1.1] text-[var(--text)] sm:text-[2.65rem]">
            {guide.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
            {guide.description}
          </p>
        </div>

        <div className="guide-hero-quote flex h-[7.25rem] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-card)] sm:h-[7.75rem]">
          <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:px-5 sm:py-3.5">
            <p className="text-sm font-semibold leading-tight text-[var(--accent)]">
              {guide.heroQuote.reference}
            </p>
            <p className="mt-1.5 line-clamp-3 font-serif-display text-[14px] italic leading-snug text-[var(--text)] sm:text-[15px]">
              {guide.heroQuote.text}
            </p>
          </div>
          <div className="flex w-[46%] min-w-[12.75rem] max-w-[15.5rem] shrink-0 items-center justify-center self-stretch border-l border-[var(--border)]/70 bg-[var(--background-soft)]/50 px-2 py-2 sm:min-w-[14rem] sm:max-w-[16.5rem]">
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)_16.75rem] lg:items-start xl:gap-10">
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
          <ol className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            {guide.sections.map((section, index) => {
              const Icon = getGuideSectionIcon(section.icon);
              return (
                <li
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  className={`scroll-mt-28 px-5 py-7 sm:px-7 sm:py-8 ${
                    index < guide.sections.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <article>
                    <div className="flex gap-4 sm:gap-5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--accent)]/45 bg-[var(--surface)] text-[var(--accent)] sm:h-12 sm:w-12">
                        <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.45} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-serif-display text-xl font-semibold leading-snug text-[var(--text)] sm:text-[1.65rem]">
                          {section.number}. {section.title}
                        </h2>

                        {section.tags.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {section.tags.map((tag) => (
                              <Link
                                key={tag.href}
                                href={tag.href}
                                className="inline-flex rounded-md border border-[var(--accent)]/20 bg-[var(--background-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] no-underline"
                              >
                                {tag.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-5 lg:ml-[3.75rem] lg:flex-row lg:items-start lg:gap-8">
                      <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-[var(--text)]/90">
                        {section.body}
                      </p>
                      {section.quote ? (
                        <SectionQuote
                          text={section.quote.text}
                          reference={section.quote.reference}
                        />
                      ) : null}
                    </div>

                    {section.quote ? (
                      <blockquote className="guide-section-quote mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-soft)] px-4 py-3.5 lg:hidden lg:ml-[3.75rem]">
                        <span
                          className="font-serif-display text-3xl leading-none text-[var(--accent)]/40"
                          aria-hidden
                        >
                          “
                        </span>
                        <p className="-mt-2 text-sm italic leading-relaxed text-[var(--text)]">
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

        <aside className="min-w-0 space-y-4">
          <div className="lg:sticky lg:top-24 lg:space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
              <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
                Pasajes clave
              </h3>
              <ul className="mt-4 space-y-3.5">
                {guide.keyPassages.map((passage) => (
                  <li key={passage.href}>
                    <Link
                      href={passage.href}
                      className="group flex gap-3 rounded-lg py-0.5 transition hover:bg-[var(--background-soft)] no-underline"
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

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
                <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
                  Descargar guía
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Lleva esta guía en PDF para estudiarla sin conexión o compartirla en tu congregación.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--accent)]/50 bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--accent)] opacity-60"
                title="Próximamente"
              >
                <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                Descargar PDF
              </button>
              <p className="mt-2 text-center text-xs text-[var(--text-muted)]">Próximamente</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
