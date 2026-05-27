"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChevronDown,
  Cross,
  Globe2,
  Hash,
  Library,
  ListFilter,
  RotateCcw,
  Search,
  Sparkles,
  WholeWord,
} from "lucide-react";

type ChapterOption = { number: number; verseCount: number };
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
type SearchIntent = "phrase" | "word" | "count";

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
              className="rounded bg-amber-100 px-0.5 text-[var(--text)] ring-1 ring-amber-200"
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
    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
      {items.map((item) => (
        <button
          key={getKey(item)}
          type="button"
          className="block w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--background-soft)] focus:bg-[var(--background-soft)] focus:outline-none"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
        >
          {render(item)}
        </button>
      ))}
    </div>
  );
}

const modeOptions = [
  { id: "phrase", label: "Frase", icon: BookOpen },
  { id: "word", label: "Palabra", icon: WholeWord },
  { id: "count", label: "Conteo exacto", icon: Hash },
] as const;

export function BibleSearchClient({ books }: { books: BookOption[] }) {
  const [q, setQ] = useState("");
  const [searchIntent, setSearchIntent] = useState<SearchIntent>("phrase");
  const [language, setLanguage] = useState("es");
  const [testament, setTestament] = useState<string>("");
  const [bookQuery, setBookQuery] = useState("");
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  const [exactWord, setExactWord] = useState("");
  const [synonymHelp, setSynonymHelp] = useState("");
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
      sp.set("mode", searchIntent === "phrase" ? "phrase" : "word");
      if (language) sp.set("language", language);
      if (testamentParam) sp.set("testament", testamentParam);
      if (selectedBook) sp.set("bookSlug", selectedBook.slug);
      if (selectedChapter) sp.set("chapter", String(selectedChapter.number));
      if (hasValidVerse && verse.trim()) sp.set("verse", String(verseNumber));

      const normalizedExactWord = searchIntent === "count" ? q.trim() : exactWord.trim();
      if (normalizedExactWord) sp.set("exactWord", normalizedExactWord);
      if (synonymHelp.trim()) sp.set("synonyms", synonymHelp.trim());

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
      setExactCount(typeof data.exactCount === "number" ? data.exactCount : null);
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

  function clearSearch() {
    setQ("");
    setExactWord("");
    setSynonymHelp("");
    setError(null);
    setHits([]);
    setFound(0);
    setExactCount(null);
  }

  const fieldClass =
    "h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] shadow-[0_1px_0_rgba(255,255,255,0.72)_inset] outline-none transition placeholder:text-[var(--text-muted)]/55 focus:border-[var(--accent)]/65 focus:ring-2 focus:ring-[var(--accent)]/10 disabled:bg-[var(--background-soft)] disabled:text-[var(--text-muted)]/70";
  const selectClass = `${fieldClass} appearance-none pr-9`;
  const labelClass = "mb-1.5 block text-sm font-medium text-[var(--text)]";

  return (
    <div className="space-y-6">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,21.5rem)]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_13.5rem]">
            <div className="min-w-0 space-y-4">
              <label className="block">
                <span className={labelClass}>Consulta</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                  <input
                    className={`${fieldClass} h-12 pl-10`}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Escribe una palabra o frase..."
                  />
                </div>
              </label>

              <div>
                <span className={labelClass}>Modo de busqueda</span>
                <div className="grid overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] sm:grid-cols-3">
                  {modeOptions.map(({ id, label, icon: Icon }) => {
                    const isActive = searchIntent === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSearchIntent(id)}
                        className={`inline-flex h-11 items-center justify-center gap-2 border-b border-[var(--border)] px-3 text-sm font-semibold transition last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                          isActive
                            ? "bg-[var(--surface-muted)] text-[var(--scripture-gold)] ring-1 ring-inset ring-[var(--scripture-gold)]/60"
                            : "text-[var(--text-muted)] hover:bg-[var(--background-soft)] hover:text-[var(--text)]"
                        }`}
                        aria-pressed={isActive}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className={labelClass}>Idioma</span>
                  <div className="relative">
                    <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                    <select
                      className={`${selectClass} pl-9`}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="es">Todos</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                  </div>
                </label>

                <label className="block">
                  <span className={labelClass}>Traduccion</span>
                  <div className="relative">
                    <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                    <select className={`${selectClass} pl-9`} defaultValue="bj">
                      <option value="bj">Biblia de Jerusalen</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                  </div>
                </label>

                <label className="block">
                  <span className={labelClass}>Testamento</span>
                  <div className="relative">
                    <Cross className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                    <select
                      className={`${selectClass} pl-9`}
                      value={testament}
                      onChange={(e) => setTestament(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="1">Antiguo</option>
                      <option value="2">Nuevo</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                  </div>
                </label>

                <label className="block">
                  <span className={labelClass}>Libro</span>
                  <div className="relative">
                    <Library className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                    <select
                      className={`${selectClass} pl-9`}
                      value={selectedBook?.slug ?? ""}
                      onChange={(e) => {
                        const book = visibleBooks.find((item) => item.slug === e.target.value);
                        setBookQuery(book?.title ?? "");
                        setChapter("");
                        setVerse("");
                      }}
                    >
                      <option value="">Todos</option>
                      {visibleBooks.map((book) => (
                        <option key={book.slug} value={book.slug}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                  </div>
                </label>
              </div>

              {searchIntent !== "count" ? (
                <label className="block">
                  <span className={labelClass}>Conteo exacto opcional</span>
                  <input
                    className={fieldClass}
                    value={exactWord}
                    onChange={(e) => setExactWord(e.target.value)}
                    placeholder="Palabra normalizada para conteo exacto"
                  />
                </label>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={runSearch}
                  disabled={loading || !q.trim()}
                  className="inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_10px_22px_-18px_rgba(70,50,24,0.9)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  {loading ? "Buscando..." : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex h-11 min-w-[8rem] items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)]/35 hover:text-[var(--text)]"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  Limpiar
                </button>
                {loading ? (
                  <span className="inline-flex h-8 items-center rounded-full border border-[var(--border)] bg-[var(--background-soft)] px-3 text-xs font-medium text-[var(--text-muted)]">
                    Buscando en la Biblia - {elapsedSeconds}s
                  </span>
                ) : null}
              </div>
            </div>

            <label className="block rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/55 p-4">
              <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--text)]">
                <span>Sinonimos de ayuda</span>
                <Sparkles className="h-4 w-4 text-[var(--scripture-gold)]" strokeWidth={1.75} aria-hidden />
              </span>
              <textarea
                className="mt-3 min-h-28 w-full resize-none border-0 bg-transparent p-0 text-sm leading-7 text-[var(--text-muted)] outline-none placeholder:text-[var(--text-muted)]"
                value={synonymHelp}
                onChange={(e) => setSynonymHelp(e.target.value)}
                placeholder={"caridad = amor\nYahveh = Senor\najenos = otros"}
              />
              <span className="mt-2 block text-xs leading-relaxed text-[var(--text-muted)]">
                Equivalencias por linea. Usalas solo como ayuda en tu busqueda.
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex items-start gap-3">
            <BookOpen className="mt-0.5 h-6 w-6 shrink-0 text-[var(--scripture-gold)]" strokeWidth={1.6} aria-hidden />
            <div>
              <h2 className="font-serif-display text-xl font-semibold leading-tight text-[var(--text)]">
                Ir a pasaje
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Accede directamente a cualquier referencia biblica.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className={labelClass}>Testamento</span>
              <div className="relative">
                <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
                <select
                  className={`${selectClass} pl-9`}
                  value={testament}
                  onChange={(e) => setTestament(e.target.value)}
                >
                  <option value="">Cualquiera</option>
                  <option value="1">Antiguo</option>
                  <option value="2">Nuevo</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
              </div>
            </label>

            <div className="relative text-sm">
              <label className="block">
                <span className={labelClass}>Libro</span>
                <input
                  className={fieldClass}
                  value={bookQuery}
                  onBlur={closeSuggestions}
                  onChange={(e) => {
                    setBookQuery(e.target.value);
                    setActiveField("book");
                  }}
                  onFocus={() => setActiveField("book")}
                  placeholder="Ej. Mateo"
                />
              </label>
              {activeField === "book" && (
                <SuggestionList
                  items={bookMatches}
                  getKey={(book) => book.slug}
                  render={(book) => (
                    <span>
                      {book.title}{" "}
                      <span className="text-xs text-[var(--text-muted)]">
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

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="relative text-sm">
                <label className="block">
                  <span className={labelClass}>Capitulo</span>
                  <input
                    className={fieldClass}
                    value={chapter}
                    disabled={!selectedBook}
                    inputMode="numeric"
                    onBlur={closeSuggestions}
                    onChange={(e) => {
                      setChapter(e.target.value.replace(/\D/g, ""));
                      setActiveField("chapter");
                    }}
                    onFocus={() => setActiveField("chapter")}
                    placeholder="Ej. 3"
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
                <label className="block">
                  <span className={labelClass}>Versiculo</span>
                  <input
                    className={fieldClass}
                    value={verse}
                    disabled={!selectedChapter}
                    inputMode="numeric"
                    onBlur={closeSuggestions}
                    onChange={(e) => {
                      setVerse(e.target.value.replace(/\D/g, ""));
                      setActiveField("verse");
                    }}
                    onFocus={() => setActiveField("verse")}
                    placeholder="Ej. 16"
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

            <button
              type="button"
              onClick={openPassage}
              disabled={!canOpenPassage}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.85} aria-hidden />
              Abrir pasaje
            </button>

            <p className="text-center text-xs leading-relaxed text-[var(--text-muted)]">
              {selectedBook
                ? `${selectedBook.title}: ${selectedBook.chapters.length} capitulos${
                    selectedChapter ? `, ${selectedChapter.verseCount} versiculos` : ""
                  }`
                : "Acceso directo a una referencia biblica."}
            </p>
          </div>
        </section>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--scripture-gold)]/60 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif-display text-2xl font-semibold leading-none text-[var(--text)]">
            Resultados
          </h2>
          <span className="inline-flex h-7 items-center rounded-full bg-[var(--background-soft)] px-3 text-xs font-semibold text-[var(--text)]">
            {found} resultado{found === 1 ? "" : "s"}
          </span>
          {exactCount !== null ? (
            <span className="inline-flex h-7 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)]">
              Conteo exacto: {exactCount}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text)]"
        >
          <ListFilter className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
          Mas relevantes
          <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <ul className="space-y-2.5">
        {hits.map((h) => (
          <li
            key={`${h.reference}-${h.text.slice(0, 12)}`}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--scripture-gold)]">
              <Cross className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={h.url}
                  className="font-serif-display text-lg font-semibold leading-tight text-[var(--text)] hover:text-[var(--accent)] hover:underline"
                >
                  {h.reference}
                </a>
                {h.matchType === "approximate" && typeof h.score === "number" ? (
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                    parecido {h.score}%
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text)]">
                <HighlightedText text={h.text} matchedWords={h.matchedWords} />
              </p>
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              <a
                href={h.url}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--scripture-gold)] hover:underline"
              >
                Leer pasaje
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </a>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--scripture-gold)]">
                <Bookmark className="h-4 w-4" strokeWidth={1.7} aria-hidden />
              </span>
            </div>
          </li>
        ))}
      </ul>

      {!hits.length && !loading ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-8 text-center text-sm text-[var(--text-muted)]">
          Escribe una consulta para ver resultados.
        </div>
      ) : null}
    </div>
  );
}
