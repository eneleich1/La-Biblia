"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type ChapterOption = {
  number: number;
  verseCount: number;
};

type BookOption = {
  slug: string;
  title: string;
  testament: number;
  chapters: ChapterOption[];
};

type Hit = {
  reference: string;
  text: string;
  url: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  score?: number;
  matchType?: "exact" | "approximate";
  matchedWords?: string[];
};

type ActiveField = "book" | "chapter" | "verse" | null;

function normalizeLookup(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function bookMatchScore(book: BookOption, query: string) {
  const title = normalizeLookup(book.title);
  const slug = normalizeLookup(book.slug.replace(/-/g, " "));
  const words = `${title} ${slug}`.split(/\s+/).filter(Boolean);

  if (!query) return 0;
  if (title.startsWith(query) || slug.startsWith(query)) return 0;
  if (words.some((word) => word.startsWith(query))) return 1;
  if (title.includes(query) || slug.includes(query)) return 2;
  return null;
}

function numberMatchScore(value: number, query: string) {
  const text = String(value);
  if (!query) return 0;
  if (text === query) return 0;
  if (text.startsWith(query)) return 1;
  if (text.includes(query)) return 2;
  return null;
}

function HighlightedText({
  text,
  matchedWords,
}: {
  text: string;
  matchedWords?: string[];
}) {
  const matched = new Set((matchedWords ?? []).map(normalizeLookup).filter(Boolean));
  if (!matched.size) return <>{text}</>;

  const parts = text.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu) ?? [text];

  return (
    <>
      {parts.map((part, index) => {
        const normalized = normalizeLookup(part);
        if (normalized && matched.has(normalized)) {
          return (
            <mark
              key={`${part}-${index}`}
              className="rounded bg-amber-100 px-0.5 text-ink ring-1 ring-amber-200"
            >
              {part}
            </mark>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function SuggestionList<T>({
  items,
  getKey,
  render,
  onSelect,
}: {
  items: T[];
  getKey: (item: T) => string;
  render: (item: T) => ReactNode;
  onSelect: (item: T) => void;
}) {
  if (!items.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-lg border border-accent-soft bg-white py-1 shadow-lg">
      {items.map((item) => (
        <button
          key={getKey(item)}
          type="button"
          className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper-alt focus:bg-paper-alt focus:outline-none"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
        >
          {render(item)}
        </button>
      ))}
    </div>
  );
}

export function BibleSearchClient({ books }: { books: BookOption[] }) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"phrase" | "word">("phrase");
  const [language, setLanguage] = useState("es");
  const [testament, setTestament] = useState<string>("");
  const [bookQuery, setBookQuery] = useState("");
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  const [exactWord, setExactWord] = useState("");
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [loading, setLoading] = useState(false);
  const [searchStartedAt, setSearchStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [found, setFound] = useState(0);
  const [exactCount, setExactCount] = useState<number | null>(null);

  const testamentParam = useMemo(() => {
    if (testament === "1" || testament === "2") return testament;
    return "";
  }, [testament]);

  const visibleBooks = useMemo(() => {
    if (!testamentParam) return books;
    return books.filter((book) => String(book.testament) === testamentParam);
  }, [books, testamentParam]);

  const bookMatches = useMemo(() => {
    const query = normalizeLookup(bookQuery);
    return visibleBooks
      .map((book) => ({ book, score: bookMatchScore(book, query) }))
      .filter((item): item is { book: BookOption; score: number } => item.score !== null)
      .sort((a, b) => a.score - b.score || a.book.testament - b.book.testament)
      .slice(0, 10)
      .map((item) => item.book);
  }, [bookQuery, visibleBooks]);

  const selectedBook = useMemo(() => {
    const query = normalizeLookup(bookQuery);
    if (!query) return null;

    const exact = visibleBooks.find((book) => normalizeLookup(book.title) === query);
    if (exact) return exact;

    const strongMatches = visibleBooks.filter((book) => {
      const score = bookMatchScore(book, query);
      return score === 0 || score === 1;
    });

    return strongMatches.length === 1 ? strongMatches[0] : null;
  }, [bookQuery, visibleBooks]);

  const chapterMatches = useMemo(() => {
    if (!selectedBook) return [];

    const query = chapter.trim();
    return selectedBook.chapters
      .map((item) => ({ item, score: numberMatchScore(item.number, query) }))
      .filter((match): match is { item: ChapterOption; score: number } => match.score !== null)
      .sort((a, b) => a.score - b.score || a.item.number - b.item.number)
      .slice(0, 12)
      .map((match) => match.item);
  }, [chapter, selectedBook]);

  const chapterNumber = Number(chapter);
  const selectedChapter = useMemo(() => {
    if (!selectedBook || !Number.isInteger(chapterNumber)) return null;
    return selectedBook.chapters.find((item) => item.number === chapterNumber) ?? null;
  }, [chapterNumber, selectedBook]);

  const verseMatches = useMemo(() => {
    if (!selectedChapter || selectedChapter.verseCount <= 0) return [];

    const query = verse.trim();
    return Array.from({ length: selectedChapter.verseCount }, (_, index) => index + 1)
      .map((item) => ({ item, score: numberMatchScore(item, query) }))
      .filter((match): match is { item: number; score: number } => match.score !== null)
      .sort((a, b) => a.score - b.score || a.item - b.item)
      .slice(0, 12)
      .map((match) => match.item);
  }, [selectedChapter, verse]);

  const verseNumber = Number(verse);
  const hasValidChapter = Boolean(selectedChapter);
  const hasValidVerse =
    !verse.trim() ||
    (Number.isInteger(verseNumber) &&
      verseNumber > 0 &&
      Boolean(selectedChapter && verseNumber <= selectedChapter.verseCount));
  const canOpenPassage = Boolean(selectedBook && hasValidChapter && hasValidVerse);

  useEffect(() => {
    if (!loading || searchStartedAt === null) return;

    setElapsedSeconds(0);
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - searchStartedAt) / 1000)));
    }, 250);

    return () => window.clearInterval(timer);
  }, [loading, searchStartedAt]);

  async function runSearch() {
    setLoading(true);
    setSearchStartedAt(Date.now());
    setElapsedSeconds(0);
    setError(null);
    try {
      const sp = new URLSearchParams();
      sp.set("q", q);
      sp.set("mode", mode);
      if (language) sp.set("language", language);
      if (testamentParam) sp.set("testament", testamentParam);
      if (selectedBook) sp.set("bookSlug", selectedBook.slug);
      if (selectedChapter) sp.set("chapter", String(selectedChapter.number));
      if (hasValidVerse && verse.trim()) sp.set("verse", String(verseNumber));
      if (exactWord.trim()) sp.set("exactWord", exactWord.trim());

      const res = await fetch(`/api/search?${sp.toString()}`);
      const data = (await res.json()) as {
        error?: string;
        hits?: Hit[];
        found?: number;
        exactCount?: number | null;
      };
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setHits(data.hits ?? []);
      setFound(data.found ?? 0);
      setExactCount(
        typeof data.exactCount === "number" ? data.exactCount : null,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setHits([]);
      setFound(0);
      setExactCount(null);
    } finally {
      setLoading(false);
      setSearchStartedAt(null);
    }
  }

  function openPassage() {
    if (!canOpenPassage || !selectedBook || !selectedChapter) return;

    const anchor = verse.trim() ? `?highlight=${verseNumber}#V${verseNumber}` : "";
    window.location.assign(
      `/biblia/${language || "es"}/${selectedBook.slug}/${selectedChapter.number}${anchor}`,
    );
  }

  function closeSuggestions() {
    window.setTimeout(() => setActiveField(null), 100);
  }

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <section className="rounded-xl border border-accent-soft bg-white p-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-accent">Buscar texto</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Busca palabras o frases y limita los resultados por pasaje si lo necesitas.
              </p>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-ink-muted">Consulta</span>
              <textarea
                className="min-h-36 w-full rounded-lg border border-accent-soft px-3 py-2"
                rows={6}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Frase o palabra..."
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="text-ink-muted">Modo</span>
                <select
                  className="w-full rounded-lg border border-accent-soft px-3 py-2"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "phrase" | "word")}
                >
                  <option value="phrase">Frase</option>
                  <option value="word">Palabra (Typesense)</option>
                </select>
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-ink-muted">Idioma</span>
                <input
                  className="w-full rounded-lg border border-accent-soft px-3 py-2"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-ink-muted">Conteo exacto (palabra normalizada)</span>
              <input
                className="w-full rounded-lg border border-accent-soft px-3 py-2"
                value={exactWord}
                onChange={(e) => setExactWord(e.target.value)}
                placeholder="opcional - usa filas VerseWord"
              />
            </label>

            <button
              type="button"
              onClick={runSearch}
              disabled={loading || !q.trim()}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
            {loading ? (
              <span className="ml-3 inline-flex items-center rounded-full border border-accent-soft px-3 py-1 text-xs font-medium text-ink-muted">
                Buscando en la Biblia - {elapsedSeconds}s
              </span>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-accent-soft bg-white p-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-accent">Ir a pasaje</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Elige libro, capitulo y versiculo para abrir una referencia directa.
              </p>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-ink-muted">Testamento</span>
              <select
                className="w-full rounded-lg border border-accent-soft px-3 py-2"
                value={testament}
                onChange={(e) => setTestament(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="1">Antiguo</option>
                <option value="2">Nuevo</option>
              </select>
            </label>

            <div className="relative text-sm">
              <label className="block space-y-1">
                <span className="text-ink-muted">Libro</span>
                <input
                  className="w-full rounded-lg border border-accent-soft px-3 py-2"
                  value={bookQuery}
                  onBlur={closeSuggestions}
                  onChange={(e) => {
                    setBookQuery(e.target.value);
                    setActiveField("book");
                  }}
                  onFocus={() => setActiveField("book")}
                  placeholder="ej. Mateo"
                />
              </label>
              {activeField === "book" && (
                <SuggestionList
                  items={bookMatches}
                  getKey={(book) => book.slug}
                  render={(book) => (
                    <span>
                      {book.title}{" "}
                      <span className="text-xs text-ink-muted">
                        {book.testament === 1 ? "AT" : "NT"}
                      </span>
                    </span>
                  )}
                  onSelect={(book) => {
                    setBookQuery(book.title);
                    setActiveField(null);
                  }}
                />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative text-sm">
                <label className="block space-y-1">
                  <span className="text-ink-muted">Capitulo</span>
                  <input
                    className="w-full rounded-lg border border-accent-soft px-3 py-2"
                    value={chapter}
                    disabled={!selectedBook}
                    inputMode="numeric"
                    onBlur={closeSuggestions}
                    onChange={(e) => {
                      setChapter(e.target.value.replace(/\D/g, ""));
                      setActiveField("chapter");
                    }}
                    onFocus={() => setActiveField("chapter")}
                    placeholder={selectedBook ? "numero" : "elige libro"}
                  />
                </label>
                {activeField === "chapter" && (
                  <SuggestionList
                    items={chapterMatches}
                    getKey={(item) => String(item.number)}
                    render={(item) => item.number}
                    onSelect={(item) => {
                      setChapter(String(item.number));
                      setVerse("");
                      setActiveField(null);
                    }}
                  />
                )}
              </div>

              <div className="relative text-sm">
                <label className="block space-y-1">
                  <span className="text-ink-muted">Versiculo</span>
                  <input
                    className="w-full rounded-lg border border-accent-soft px-3 py-2"
                    value={verse}
                    disabled={!selectedChapter}
                    inputMode="numeric"
                    onBlur={closeSuggestions}
                    onChange={(e) => {
                      setVerse(e.target.value.replace(/\D/g, ""));
                      setActiveField("verse");
                    }}
                    onFocus={() => setActiveField("verse")}
                    placeholder={selectedChapter ? "opcional" : "elige capitulo"}
                  />
                </label>
                {activeField === "verse" && (
                  <SuggestionList
                    items={verseMatches}
                    getKey={(item) => String(item)}
                    render={(item) => item}
                    onSelect={(item) => {
                      setVerse(String(item));
                      setActiveField(null);
                    }}
                  />
                )}
              </div>
            </div>

            <p className="min-h-5 text-xs text-ink-muted">
              {selectedBook
                ? `${selectedBook.title}: ${selectedBook.chapters.length} capitulos${
                    selectedChapter ? `, ${selectedChapter.verseCount} versiculos` : ""
                  }`
                : "Escribe para ver libros del Antiguo y Nuevo Testamento."}
            </p>

            <button
              type="button"
              onClick={openPassage}
              disabled={!canOpenPassage}
              className="w-full rounded-lg border border-accent bg-white px-5 py-2 text-sm font-medium text-accent disabled:opacity-50"
            >
              Ir al pasaje
            </button>
          </div>
        </section>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="text-sm text-ink-muted">
        Resultados: <strong>{found}</strong>
        {exactCount !== null && (
          <>
            {" "}
            - Conteo exacto (PostgreSQL): <strong>{exactCount}</strong>
          </>
        )}
      </div>

      <ul className="space-y-4">
        {hits.map((h) => (
          <li key={`${h.reference}-${h.text.slice(0, 12)}`} className="rounded-xl border border-accent-soft bg-white p-4">
            <a href={h.url} className="font-semibold text-accent hover:underline">
              {h.reference}
            </a>
            {h.matchType === "approximate" && typeof h.score === "number" ? (
              <span className="ml-2 rounded-full border border-accent-soft px-2 py-0.5 text-xs font-medium text-ink-muted">
                parecido {h.score}%
              </span>
            ) : null}
            <p className="mt-2 text-ink">
              <HighlightedText text={h.text} matchedWords={h.matchedWords} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
