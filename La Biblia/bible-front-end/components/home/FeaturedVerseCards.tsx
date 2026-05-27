"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { CalendarDays, Quote } from "lucide-react";
import { FeaturedCardNav } from "@/components/home/FeaturedCardNav";
import { useSiteTheme } from "@/components/theme/ThemeProvider";
import {
  addDaysToDateKey,
  compareDateKeys,
  getTodayDateKey,
  isDateKeyAfterToday,
} from "@/lib/dailyReading";
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

const DAILY_READING_MIN_DATE = "2000-01-01";

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
const RANDOM_VERSE_TIMEOUT_MS = 8_000;

export function FeaturedVerseCards({ className = "" }: FeaturedVerseCardsProps) {
  const { randomVerseIntervalMs } = useSiteTheme();
  const [verseState, setVerseState] = useState<{ items: RandomVerse[]; index: number }>({
    items: [fallbackVerse],
    index: 0,
  });
  const [dailyReading, setDailyReading] = useState<DailyReading>(fallbackDailyReading);
  const [selectedDateKey, setSelectedDateKey] = useState(() => getTodayDateKey());
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [loadingDailyReading, setLoadingDailyReading] = useState(false);
  const randomVerseRequestRef = useRef<AbortController | null>(null);
  const dailyReadingRequestRef = useRef<AbortController | null>(null);
  const dailyDateInputRef = useRef<HTMLInputElement>(null);
  const verse = verseState.items[verseState.index] ?? fallbackVerse;
  const canGoBack = verseState.index > 0;
  const hasForwardVerse = verseState.index < verseState.items.length - 1;
  const todayDateKey = getTodayDateKey();
  const canGoForwardDaily = compareDateKeys(selectedDateKey, todayDateKey) < 0;
  const canGoBackDaily = compareDateKeys(selectedDateKey, DAILY_READING_MIN_DATE) > 0;

  const fetchDailyReading = useCallback((dateKey: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || isDateKeyAfterToday(dateKey)) {
      return undefined;
    }

    if (dailyReadingRequestRef.current) {
      dailyReadingRequestRef.current.abort();
    }

    const controller = new AbortController();
    dailyReadingRequestRef.current = controller;
    setLoadingDailyReading(true);
    setSelectedDateKey(dateKey);
    setDailyReading((current) => ({
      ...current,
      date: dateKey,
      sections: current.date === dateKey ? current.sections : [],
    }));

    fetch(`/api/daily-reading?date=${encodeURIComponent(dateKey)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        const nextDailyReading = (await res.json()) as DailyReading;
        const resolvedDate = nextDailyReading.date || dateKey;

        setSelectedDateKey(resolvedDate);
        setDailyReading({
          ...nextDailyReading,
          date: resolvedDate,
          displayDate: nextDailyReading.displayDate || resolvedDate,
          celebration:
            nextDailyReading.celebration ||
            (nextDailyReading.sections.length
              ? ""
              : "Lecturas del dia no disponibles para esta fecha"),
          sections: nextDailyReading.sections ?? [],
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDailyReading({
          ...fallbackDailyReading,
          date: dateKey,
          displayDate: dateKey,
          celebration: "Lecturas del dia no disponibles para esta fecha",
          sections: [],
        });
      })
      .finally(() => {
        if (dailyReadingRequestRef.current === controller) {
          dailyReadingRequestRef.current = null;
          setLoadingDailyReading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const showPreviousDailyReading = useCallback(() => {
    const previousDateKey = addDaysToDateKey(selectedDateKey, -1);
    if (!previousDateKey || compareDateKeys(previousDateKey, DAILY_READING_MIN_DATE) < 0) {
      return;
    }

    fetchDailyReading(previousDateKey);
  }, [fetchDailyReading, selectedDateKey]);

  const showNextDailyReading = useCallback(() => {
    if (!canGoForwardDaily) return;

    const nextDateKey = addDaysToDateKey(selectedDateKey, 1);
    if (!nextDateKey || isDateKeyAfterToday(nextDateKey)) return;

    fetchDailyReading(nextDateKey);
  }, [canGoForwardDaily, fetchDailyReading, selectedDateKey]);

  const openDailyReadingCalendar = useCallback(() => {
    const input = dailyDateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }, []);

  const handleDailyReadingDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextDateKey = event.target.value;
      if (!nextDateKey || isDateKeyAfterToday(nextDateKey)) return;

      fetchDailyReading(nextDateKey);
    },
    [fetchDailyReading],
  );

  const fetchNextVerse = useCallback((options: { showLoading?: boolean } = {}) => {
    const showLoading = options.showLoading ?? true;
    if (randomVerseRequestRef.current) {
      randomVerseRequestRef.current.abort();
      setLoadingVerse(false);
    }

    const controller = new AbortController();
    randomVerseRequestRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), RANDOM_VERSE_TIMEOUT_MS);

    if (showLoading) setLoadingVerse(true);

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
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (randomVerseRequestRef.current === controller) {
          randomVerseRequestRef.current = null;
          if (showLoading) setLoadingVerse(false);
        }
      });
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

    return fetchNextVerse({ showLoading: true });
  }, [fetchNextVerse, verseState.index, verseState.items.length]);

  useEffect(() => {
    const abort = fetchDailyReading(getTodayDateKey());
    return abort;
  }, [fetchDailyReading]);

  useEffect(() => {
    const abort = fetchNextVerse({ showLoading: false });
    return abort;
  }, [fetchNextVerse]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchNextVerse({ showLoading: false });
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
  const dailyReadingEmptyMessage = dailyReading.sections.length
    ? null
    : dailyReading.celebration || "Lecturas del dia no disponibles para esta fecha";

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
          <input
            ref={dailyDateInputRef}
            type="date"
            value={selectedDateKey}
            min={DAILY_READING_MIN_DATE}
            max={todayDateKey}
            onChange={handleDailyReadingDateChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          <button
            type="button"
            onClick={openDailyReadingCalendar}
            className="daily-icon absolute right-0 top-0 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/25 transition hover:bg-white/14"
            aria-label="Elegir fecha de las lecturas"
            title="Elegir fecha"
          >
            <CalendarDays className="h-3.5 w-3.5 text-white/95" strokeWidth={1.75} />
          </button>
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
                {loadingDailyReading ? "Cargando lecturas..." : dailyReadingEmptyMessage}
              </p>
            )}
            <div className="mt-2 flex w-full min-h-7 items-center justify-between gap-2">
              <Link
                href={dailyReading.sourceUrl}
                className="inline-flex min-h-5 min-w-0 flex-1 items-center gap-2 truncate text-sm font-semibold text-[#62b0ff] no-underline visited:text-[#62b0ff] underline-offset-4 transition hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                <span className="truncate">Ver en {dailyReading.sourceName}</span>
                <span className="shrink-0" aria-hidden>
                  {"->"}
                </span>
              </Link>
              <FeaturedCardNav
                variant="daily"
                onPrevious={showPreviousDailyReading}
                onNext={showNextDailyReading}
                previousDisabled={!canGoBackDaily || loadingDailyReading}
                nextDisabled={!canGoForwardDaily || loadingDailyReading}
                nextLoading={loadingDailyReading}
                previousLabel="Dia anterior"
                nextLabel={canGoForwardDaily ? "Dia siguiente" : "Ya estas en hoy"}
              />
            </div>
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
          <div className="mt-2 flex w-full min-h-7 items-center justify-end">
            <FeaturedCardNav
              onPrevious={showPreviousVerse}
              onNext={showNextVerse}
              previousDisabled={!canGoBack}
              nextLoading={loadingVerse}
              previousLabel="Versiculo anterior"
              nextLabel={hasForwardVerse ? "Versiculo siguiente" : "Generar otro versiculo"}
              linkHref={verse.href}
            />
          </div>
        </div>
      </article>
    </div>
  );
}
