"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Cross } from "lucide-react";
import { BiblicalNotesList } from "@/components/estudios/notas-biblicas/BiblicalNotesList";
import { BiblicalNotesSidebar } from "@/components/estudios/notas-biblicas/BiblicalNotesSidebar";
import type { BibleBookRow } from "@/data/bibleNoteSidebar";
import {
  countNotesByTestament,
  type BiblicalNote,
  type TestamentKey,
} from "@/lib/parseBiblicalNotes";

type Props = {
  notes: BiblicalNote[];
  books: BibleBookRow[];
};

export function BiblicalNotesPage({ notes, books }: Props) {
  const [activeTestament, setActiveTestament] = useState<TestamentKey>("ot");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const counts = useMemo(() => countNotesByTestament(notes), [notes]);

  const booksBySlug = useMemo(
    () => new Map(books.map((b) => [b.slug, { slug: b.slug, nameEs: b.nameEs }])),
    [books],
  );

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (note.testament !== activeTestament) return false;
      if (activeLetter && note.sortLetter !== activeLetter) return false;
      return true;
    });
  }, [notes, activeTestament, activeLetter]);

  const handleTestamentChange = (testament: TestamentKey) => {
    setActiveTestament(testament);
    setExpandedCategoryId(null);
  };

  const handleToggleCategory = (id: string) => {
    setExpandedCategoryId((current) => (current === id ? null : id));
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-6">
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/estudios" className="transition hover:text-[var(--accent)]">
              Estudios
            </Link>
          </li>
          <li aria-hidden className="text-[var(--text-muted)]/50">
            /
          </li>
          <li className="font-medium text-[var(--text)]" aria-current="page">
            Notas bíblicas
          </li>
        </ol>
      </nav>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <BiblicalNotesSidebar
          books={books}
          activeTestament={activeTestament}
          onTestamentChange={handleTestamentChange}
          expandedCategoryId={expandedCategoryId}
          onToggleCategory={handleToggleCategory}
          activeLetter={activeLetter}
          onLetterChange={setActiveLetter}
        />

        <div className="min-w-0 flex-1">
          <header className="space-y-4">
            <div>
              <h1 className="page-title">
                Notas bíblicas
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
                Recopilación de notas y referencias bíblicas organizadas por temas y pasajes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleTestamentChange("ot")}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeTestament === "ot"
                    ? "border-[var(--accent)]/40 bg-[var(--surface-muted)] text-[var(--text)] shadow-[var(--shadow-card)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/25"
                }`}
              >
                <BookOpen className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
                Antiguo Testamento
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-bold text-[var(--accent)]">
                  {counts.ot}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTestamentChange("nt")}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeTestament === "nt"
                    ? "border-[var(--accent)]/40 bg-[var(--surface-muted)] text-[var(--text)] shadow-[var(--shadow-card)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/25"
                }`}
              >
                <Cross className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
                Nuevo Testamento
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-bold text-[var(--accent)]">
                  {counts.nt}
                </span>
              </button>
            </div>
          </header>

          <div className="mt-6">
            <BiblicalNotesList
              notes={filteredNotes}
              testament={activeTestament}
              booksBySlug={booksBySlug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
