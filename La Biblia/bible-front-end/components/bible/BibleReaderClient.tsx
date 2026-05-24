"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { formatBibleBookTitle } from "@/lib/formatTitle";
import { useSiteTheme } from "@/components/theme/ThemeProvider";

type StaticBookSummary = {
  testament: number;
  order: number;
  slug: string;
  nameEs: string;
  category: string | null;
  chapters: { number: number }[];
};

type StaticVerse = {
  verseNumber: number;
  text: string;
};

type StaticChapter = {
  number: number;
  title?: string;
  shortTitle?: string;
  verses: StaticVerse[];
};

type StaticBook = {
  testament: number;
  order: number;
  slug: string;
  nameEs: string;
  chapters: StaticChapter[];
};

type StaticManifest = {
  books: StaticBookSummary[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  return res.json() as Promise<T>;
}

function getManifest(language: string) {
  return fetchJson<StaticManifest>(`/bible-static/${language}/manifest.json`);
}

function getBook(language: string, bookSlug: string) {
  return fetchJson<StaticBook>(`/bible-static/${language}/books/${bookSlug}.json`);
}

function updateUrl(language: string, bookSlug: string, chapterNumber: number) {
  const url = `/biblia/${language}/${bookSlug}/${chapterNumber}`;
  window.history.pushState({ language, bookSlug, chapterNumber }, "", url);
}

function parseHighlight(value?: string | null) {
  const parts = (value ?? "")
    .split("-")
    .map((part) => parseInt(part, 10))
    .filter((part) => Number.isFinite(part) && part > 0);
  const start = parts[0] ?? null;
  return { start, end: parts[1] ?? start };
}

export function BibleReaderClient({
  initialLanguage,
  initialBookSlug,
  initialChapter,
  initialBook,
  initialHighlight,
}: {
  initialLanguage: string;
  initialBookSlug: string;
  initialChapter: number;
  initialBook: StaticBook;
  initialHighlight?: string;
}) {
  const [language] = useState(initialLanguage);
  const [bookSlug, setBookSlug] = useState(initialBookSlug);
  const [chapterNumber, setChapterNumber] = useState(initialChapter);
  const [manifest, setManifest] = useState<StaticManifest | null>(null);
  const [book, setBook] = useState<StaticBook | null>(initialBook);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { bookTitleMode } = useSiteTheme();

  useEffect(() => {
    setBook(initialBook);
  }, [initialBook]);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    Promise.all([getManifest(language), getBook(language, bookSlug)])
      .then(([nextManifest, nextBook]) => {
        if (cancelled) return;
        setManifest(nextManifest);
        setBook(nextBook);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la Biblia.");
      });

    return () => {
      cancelled = true;
    };
  }, [language, bookSlug]);

  useEffect(() => {
    const onPopState = () => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const nextLanguage = parts[1];
      const nextBook = parts[2];
      const nextChapter = parseInt(parts[3] ?? "1", 10);
      if (nextLanguage === language && nextBook && Number.isFinite(nextChapter)) {
        setBookSlug(nextBook);
        setChapterNumber(nextChapter);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [language]);

  const bookSummary = useMemo(() => {
    return manifest?.books.find((item) => item.slug === bookSlug) ?? null;
  }, [bookSlug, manifest]);

  const adjacent = useMemo(() => {
    if (!manifest || !bookSummary) return { prevSlug: null as string | null, nextSlug: null as string | null };
    const sorted = [...manifest.books].sort(
      (a, b) => a.testament - b.testament || a.order - b.order,
    );
    const index = sorted.findIndex((item) => item.slug === bookSummary.slug);
    return {
      prevSlug: index > 0 ? sorted[index - 1]?.slug ?? null : null,
      nextSlug: index >= 0 && index < sorted.length - 1 ? sorted[index + 1]?.slug ?? null : null,
    };
  }, [bookSummary, manifest]);

  const activeBook = book ?? initialBook;
  const chapter = activeBook.chapters.find((item) => item.number === chapterNumber) ?? null;
  const chapterNumbers = useMemo(
    () => activeBook.chapters.map((item) => item.number).sort((a, b) => a - b),
    [activeBook],
  );
  const chapterIndex = chapterNumbers.indexOf(chapterNumber);
  const prevChapterNumber = chapterIndex > 0 ? chapterNumbers[chapterIndex - 1]! : null;
  const nextChapterNumber =
    chapterIndex >= 0 && chapterIndex < chapterNumbers.length - 1
      ? chapterNumbers[chapterIndex + 1]!
      : null;
  const bookTitle = formatBibleBookTitle(
    bookSummary?.nameEs ?? book?.nameEs ?? "",
    bookSummary?.slug ?? book?.slug,
    bookTitleMode,
  );
  const highlight = parseHighlight(initialHighlight);
  const verses = chapter?.verses ?? [];
  const half = Math.ceil(verses.length / 2);
  const left = verses.slice(0, half);
  const right = verses.slice(half);

  function goToChapter(nextBookSlug: string, nextChapter: number) {
    startTransition(() => {
      setBookSlug(nextBookSlug);
      setChapterNumber(nextChapter);
      updateUrl(language, nextBookSlug, nextChapter);
      void getBook(language, nextBookSlug);
    });
  }

  function VerseCol({ list }: { list: StaticVerse[] }) {
    return (
      <div className="scripture-verse-column">
        <div className="scripture-page-mark" aria-hidden>
          <span />
        </div>
        {list.map((verse) => {
          const isHighlighted =
            highlight.start !== null &&
            highlight.end !== null &&
            verse.verseNumber >= highlight.start &&
            verse.verseNumber <= highlight.end;

          return (
            <p
              key={verse.verseNumber}
              id={`V${verse.verseNumber}`}
              className={["scripture-verse", isHighlighted ? "scripture-highlighted" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="scripture-verse-number">{verse.verseNumber}</span>
              <span className="scripture-verse-text">{verse.text}</span>
            </p>
          );
        })}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {error}
      </div>
    );
  }

  if (!chapter || !bookSummary) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-card)]">
        Cargando capitulo...
      </div>
    );
  }

  return (
    <article className="scripture-reader-shell">
      <div className="scripture-reader-layout">
        <aside className="scripture-reader-aside" aria-label="Navegacion del libro">
          <div className="scripture-reader-aside-card">
            <Link href={`/biblia/${language}`} className="scripture-back-link">
              Inicio
            </Link>
            <div className="scripture-aside-title-block">
              <p className="scripture-aside-kicker">Libro</p>
              <div className="scripture-aside-title-row">
                <h2>{bookTitle}</h2>
                <div className="scripture-aside-actions" aria-label="Navegacion de capitulos">
                  {prevChapterNumber !== null ? (
                    <button
                      type="button"
                      onClick={() => goToChapter(bookSlug, prevChapterNumber)}
                      aria-label="Capitulo anterior"
                      title="Capitulo anterior"
                    >
                      <ArrowLeft aria-hidden />
                    </button>
                  ) : (
                    <span aria-label="Capitulo anterior no disponible" title="Capitulo anterior">
                      <ArrowLeft aria-hidden />
                    </span>
                  )}
                  {nextChapterNumber !== null ? (
                    <button
                      type="button"
                      onClick={() => goToChapter(bookSlug, nextChapterNumber)}
                      aria-label="Capitulo siguiente"
                      title="Capitulo siguiente"
                    >
                      <ArrowRight aria-hidden />
                    </button>
                  ) : (
                    <span aria-label="Capitulo siguiente no disponible" title="Capitulo siguiente">
                      <ArrowRight aria-hidden />
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="scripture-chapter-grid" aria-label="Capitulos">
              {activeBook.chapters.map((item) => (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => goToChapter(bookSlug, item.number)}
                  aria-current={item.number === chapterNumber ? "page" : undefined}
                >
                  {String(item.number).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div className="scripture-book-rail">
              {adjacent.prevSlug ? (
                <button
                  type="button"
                  onClick={() => goToChapter(adjacent.prevSlug!, 1)}
                  aria-label="Libro anterior"
                  title="Libro anterior"
                >
                  <ChevronsLeft aria-hidden />
                </button>
              ) : null}
              {adjacent.nextSlug ? (
                <button
                  type="button"
                  onClick={() => goToChapter(adjacent.nextSlug!, 1)}
                  aria-label="Libro siguiente"
                  title="Libro siguiente"
                >
                  <ChevronsRight aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="scripture-reader-main" aria-busy={isPending}>
          <header className="scripture-chapter-heading">
            <div className="scripture-flourish" aria-hidden>
              <span />
            </div>
            <h1>{bookTitle}</h1>
            <p>
              <span aria-hidden />
              Capitulo {chapterNumber}
              <span aria-hidden />
            </p>
          </header>

          <div className="scripture-open-book scripture-reader-book">
            <section className="scripture-reading-page">
              <VerseCol list={left} />
            </section>
            <section className="scripture-reading-page">
              <VerseCol list={right} />
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
