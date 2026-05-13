"use client";

import { useMemo, useState } from "react";

type Hit = {
  reference: string;
  text: string;
  url: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
};

export function BibleSearchClient() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"phrase" | "word">("phrase");
  const [language, setLanguage] = useState("es");
  const [testament, setTestament] = useState<string>("");
  const [bookSlug, setBookSlug] = useState("");
  const [chapter, setChapter] = useState("");
  const [exactWord, setExactWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [found, setFound] = useState(0);
  const [exactCount, setExactCount] = useState<number | null>(null);

  const testamentParam = useMemo(() => {
    if (testament === "1" || testament === "2") return testament;
    return "";
  }, [testament]);

  async function runSearch() {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams();
      sp.set("q", q);
      sp.set("mode", mode);
      if (language) sp.set("language", language);
      if (testamentParam) sp.set("testament", testamentParam);
      if (bookSlug.trim()) sp.set("bookSlug", bookSlug.trim());
      if (chapter.trim()) sp.set("chapter", chapter.trim());
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
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-ink-muted">Consulta</span>
          <textarea
            className="w-full rounded-lg border border-accent-soft px-3 py-2"
            rows={3}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Frase o palabra…"
          />
        </label>
        <div className="space-y-3 text-sm">
          <label className="block space-y-1">
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
          <label className="block space-y-1">
            <span className="text-ink-muted">Idioma</span>
            <input
              className="w-full rounded-lg border border-accent-soft px-3 py-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-ink-muted">Testamento (1 AT, 2 NT)</span>
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
          <label className="block space-y-1">
            <span className="text-ink-muted">Slug del libro</span>
            <input
              className="w-full rounded-lg border border-accent-soft px-3 py-2"
              value={bookSlug}
              onChange={(e) => setBookSlug(e.target.value)}
              placeholder="ej. genesis"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-ink-muted">Capítulo (filtro)</span>
            <input
              className="w-full rounded-lg border border-accent-soft px-3 py-2"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="número"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-ink-muted">Conteo exacto (palabra normalizada)</span>
            <input
              className="w-full rounded-lg border border-accent-soft px-3 py-2"
              value={exactWord}
              onChange={(e) => setExactWord(e.target.value)}
              placeholder="opcional — usa filas VerseWord"
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={runSearch}
        disabled={loading || !q.trim()}
        className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Buscando…" : "Buscar"}
      </button>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="text-sm text-ink-muted">
        Resultados Typesense: <strong>{found}</strong>
        {exactCount !== null && (
          <>
            {" "}
            · Conteo exacto (PostgreSQL): <strong>{exactCount}</strong>
          </>
        )}
      </div>

      <ul className="space-y-4">
        {hits.map((h) => (
          <li key={`${h.reference}-${h.text.slice(0, 12)}`} className="rounded-xl border border-accent-soft bg-white p-4">
            <a href={h.url} className="font-semibold text-accent hover:underline">
              {h.reference}
            </a>
            <p className="mt-2 text-ink">{h.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
