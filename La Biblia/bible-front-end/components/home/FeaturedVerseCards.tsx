"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useSiteTheme } from "@/components/theme/ThemeProvider";
import { formatBibleReference } from "@/lib/formatTitle";

type FeaturedVerseCardsProps = {
  className?: string;
};

type RandomVerse = {
  reference: string;
  text: string;
  href: string;
};

type DailyReadingSection = {
  kind: "first" | "psalm" | "second" | "gospel";
  label: string;
  reference: string;
  href?: string;
};

type DailyReading = {
  date: string;
  displayDate: string;
  celebration: string;
  sections: DailyReadingSection[];
  sourceName: string;
  sourceUrl: string;
  supplementalSourceName?: string;
  supplementalSourceUrl?: string;
};

const fallbackVerse: RandomVerse = {
  reference: "Salmo 119:105",
  text: "Lampara es a mis pies tu palabra, y lumbrera a mi camino.",
  href: "/biblia/es/los-salmos/119?highlight=105#V105",
};

const fallbackDailyReading: DailyReading = {
  date: "",
  displayDate: "Lecturas liturgicas de hoy",
  celebration: "No se pudieron cargar las lecturas del dia",
  sections: [],
  sourceName: "Vatican News",
  sourceUrl: "https://www.vaticannews.va/es/evangelio-de-hoy.html",
};

const dailyReadingShortLabels: Record<DailyReadingSection["kind"], string> = {
  first: "1ra lectura",
  psalm: "Salmo",
  second: "2da lectura",
  gospel: "Evangelio",
};

const MAX_RANDOM_VERSE_HISTORY = 6;

export function FeaturedVerseCards({ className = "" }: FeaturedVerseCardsProps) {
  const { randomVerseIntervalMs } = useSiteTheme();
  const [verseState, setVerseState] = useState<{ items: RandomVerse[]; index: number }>({
    items: [fallbackVerse],
    index: 0,
  });
  const [dailyReading, setDailyReading] = useState<DailyReading>(fallbackDailyReading);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const verse = verseState.items[verseState.index] ?? fallbackVerse;
  const canGoBack = verseState.index > 0;
  const hasForwardVerse = verseState.index < verseState.items.length - 1;

  const fetchNextVerse = useCallback(() => {
    const controller = new AbortController();
    setLoadingVerse(true);
    fetch("/api/random-verse", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load random verse");
        return res.json() as Promise<RandomVerse>;
      })
      .then((nextVerse) => {
        if (nextVerse.reference && nextVerse.text && nextVerse.href) {
          setVerseState((current) => {
            const activeHistory = current.items.slice(0, current.index + 1);
            const nextItems = [...activeHistory, nextVerse].slice(-MAX_RANDOM_VERSE_HISTORY);
            return { items: nextItems, index: nextItems.length - 1 };
          });
        }
      })
      .catch(() => {
        /* keep current verse */
      })
      .finally(() => setLoadingVerse(false));
    return () => controller.abort();
  }, []);

  const showPreviousVerse = useCallback(() => {
    setVerseState((current) => ({
      ...current,
      index: Math.max(0, current.index - 1),
    }));
  }, []);

  const showNextVerse = useCallback(() => {
    if (verseState.index < verseState.items.length - 1) {
      setVerseState((current) => ({ ...current, index: current.index + 1 }));
      return undefined;
    }

    return fetchNextVerse();
  }, [fetchNextVerse, verseState.index, verseState.items.length]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/daily-reading", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load daily reading");
        return res.json() as Promise<DailyReading>;
      })
      .then((nextDailyReading) => {
        if (nextDailyReading.displayDate && nextDailyReading.sections) {
          setDailyReading(nextDailyReading);
        }
      })
      .catch(() => {
        /* keep fallback reading */
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const abort = fetchNextVerse();
    return abort;
  }, [fetchNextVerse]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchNextVerse();
    }, randomVerseIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [fetchNextVerse, randomVerseIntervalMs]);

  const renderDailySection = (section: DailyReadingSection) => {
    const content = (
      <>
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.04em] text-[#9ccaff]">
          {dailyReadingShortLabels[section.kind]}
        </span>
        <span className="min-w-0 truncate text-sm font-semibold leading-snug text-white/95">
          {formatBibleReference(section.reference, section.href, "short")}
        </span>
      </>
    );

    if (!section.href) {
      return (
        <div key={section.kind} className="grid grid-cols-[5.25rem_1fr] items-baseline gap-2">
          {content}
        </div>
      );
    }

    return (
      <Link
        key={section.kind}
        href={section.href}
        className="grid grid-cols-[5.25rem_1fr] items-baseline gap-2 rounded-sm no-underline transition hover:bg-white/10"
      >
        {content}
      </Link>
    );
  };

  const formattedVerseReference = formatBibleReference(verse.reference, verse.href, "short");

  return (
    <div
      className={`grid max-w-[42rem] grid-cols-1 gap-5 sm:grid-cols-2 lg:max-w-[43rem] xl:max-w-[45rem] ${className}`}
    >
      <article className="daily-card motion-card relative h-[10.5rem] overflow-hidden rounded-lg border border-[#0c356f]/10 bg-[var(--surface-strong)] p-4 text-[var(--accent-foreground)] shadow-[var(--shadow-card)] sm:h-[10.5rem] sm:p-4">
        <div
          className="pointer-events-none absolute bottom-4 right-4 h-16 w-28 text-white opacity-[0.12]"
          aria-hidden
        >
          <svg viewBox="0 0 140 82" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M69 24C54 12 35 9 16 17v43c20-7 38-4 53 9V24Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M71 24c15-12 34-15 53-7v43c-20-7-38-4-53 9V24Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M22 24c14-4 27-2 40 6M78 30c13-8 27-10 40-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity=".55"
            />
            <path
              d="M6 68c22-9 44-7 63 8 19-15 41-17 65-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity=".75"
            />
          </svg>
        </div>
        <div className="relative h-full">
          <span
            className="daily-icon absolute right-0 top-0 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/25"
            aria-hidden
          >
            <CalendarDays className="h-3.5 w-3.5 text-white/95" strokeWidth={1.75} />
          </span>
          <div className="grid h-full min-w-0 grid-rows-[auto_1fr_auto] pr-8">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#58a2ff]">
                Lecturas del dia
              </p>
              <h2 className="mt-0.5 line-clamp-1 text-xs font-semibold leading-tight text-white/82">
                {dailyReading.displayDate}
              </h2>
            </div>
            {dailyReading.sections.length ? (
              <div className="mt-2 grid content-start gap-0.5 overflow-hidden text-sm leading-snug">
                {dailyReading.sections.map(renderDailySection)}
              </div>
            ) : (
              <p className="mt-2 line-clamp-2 text-sm italic leading-snug text-white/80">
                Consulta la fuente para ver las lecturas disponibles.
              </p>
            )}
            <Link
              href={dailyReading.sourceUrl}
              className="mt-2 inline-flex min-h-5 items-center gap-2 self-end text-sm font-semibold text-[#62b0ff] no-underline visited:text-[#62b0ff] underline-offset-4 transition hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Ver en {dailyReading.sourceName}
              <span aria-hidden>{"->"}</span>
            </Link>
          </div>
        </div>
      </article>

      <article className="random-verse-card motion-card relative h-[10.5rem] overflow-hidden rounded-lg border border-[#cfe4f7] bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(247,252,255,0.92)_54%,rgba(231,243,255,0.76)_100%)] p-4 shadow-[var(--shadow-card)] sm:h-[10.5rem] sm:p-4">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(ellipse_at_center,rgba(214,234,255,0.58)_0%,rgba(232,244,255,0.28)_48%,transparent_76%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-4 top-8 w-20 text-[#9dc8f5] opacity-55 sm:w-24"
          aria-hidden
        >
          <svg
            viewBox="0 0 130 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <path d="M62 156C65 114 64 70 54 25" stroke="currentColor" strokeWidth="2" />
            <path
              d="M62 112C84 101 99 84 106 61C82 66 67 82 62 112Z"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path
              d="M58 91C35 82 21 67 14 46C39 49 53 65 58 91Z"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path
              d="M58 59C78 50 91 35 96 15C75 18 62 34 58 59Z"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path
              d="M64 137C88 128 105 111 114 87C88 92 70 110 64 137Z"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="currentColor"
              fillOpacity="0.08"
            />
          </svg>
        </div>
        <div className="relative grid h-full grid-rows-[auto_1fr_auto] pr-20 sm:pr-24">
          <div className="flex items-start gap-3">
            <span
              className="random-verse-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white ring-1 ring-[var(--border)]"
              aria-hidden
            >
              <Quote className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
                Versiculo al azar
              </p>
              <h2 className="mt-0.5 line-clamp-1 font-serif-display text-base font-semibold leading-tight text-[var(--text)]">
                {formattedVerseReference}
              </h2>
            </div>
          </div>
          <p className="mt-2 line-clamp-3 max-w-[19rem] overflow-hidden text-sm italic leading-snug text-[var(--text)]">
            {verse.text}
          </p>
          <div className="mt-2 flex min-h-7 items-center gap-2 self-end">
            <button
              type="button"
              onClick={showPreviousVerse}
              disabled={!canGoBack}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 text-[var(--text)] shadow-[0_8px_16px_-12px_rgba(15,23,42,0.45)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Versiculo anterior"
              title="Versiculo anterior"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={showNextVerse}
              disabled={loadingVerse}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 text-[var(--text)] shadow-[0_8px_16px_-12px_rgba(15,23,42,0.45)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-wait disabled:opacity-60"
              aria-label={hasForwardVerse ? "Versiculo siguiente" : "Generar otro versiculo"}
              title={hasForwardVerse ? "Versiculo siguiente" : "Generar otro versiculo"}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <Link
              href={verse.href}
              className="ml-1 text-sm font-semibold text-[var(--accent)] no-underline underline-offset-4 hover:underline"
            >
              Leer
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
