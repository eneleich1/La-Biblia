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
      if (activeLetter && note.sortLetter !== activeLetter) return false;
      return true;
    });
  }, [notes, activeLetter]);

  const handleTestamentChange = (testament: TestamentKey) => {
    setActiveTestament(testament);
    setExpandedCategoryId(null);
  };

  const handleToggleCategory = (id: string) => {
    setExpandedCategoryId((current) => (current === id ? null : id));
  };

  return (
    <div className="mx-auto w-full max-w-[94rem] pb-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
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
            <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link
                    href="/estudios"
                    className="font-medium text-[var(--accent)] transition hover:text-[var(--text)]"
                  >
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

            <div>
              <h1 className="font-serif-display text-[clamp(2.35rem,4.6vw,3.55rem)] font-semibold leading-[0.98] tracking-[0] text-[var(--text)]">
                Notas bíblicas
              </h1>
              <p className="mt-3 max-w-3xl text-[1.05rem] leading-relaxed text-[var(--text-muted)]">
                Recopilación de notas y referencias bíblicas organizadas por temas y pasajes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleTestamentChange("ot")}
                className={`inline-flex min-w-[13.6rem] items-center justify-center gap-3 rounded-lg border px-5 py-3 text-base font-semibold transition ${
                  activeTestament === "ot"
                    ? "border-[var(--accent)]/40 bg-[var(--surface-muted)] text-[var(--text)] shadow-[0_10px_24px_-22px_rgba(70,50,24,0.55)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]/35 hover:bg-[var(--surface-muted)]"
                }`}
              >
                <BookOpen className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
                Antiguo Testamento
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-bold leading-none text-[var(--accent-foreground)]">
                  {counts.ot}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTestamentChange("nt")}
                className={`inline-flex min-w-[13.6rem] items-center justify-center gap-3 rounded-lg border px-5 py-3 text-base font-semibold transition ${
                  activeTestament === "nt"
                    ? "border-[var(--accent)]/40 bg-[var(--surface-muted)] text-[var(--text)] shadow-[0_10px_24px_-22px_rgba(70,50,24,0.55)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]/35 hover:bg-[var(--surface-muted)]"
                }`}
              >
                <Cross className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
                Nuevo Testamento
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-bold leading-none text-[var(--accent-foreground)]">
                  {counts.nt}
                </span>
              </button>
            </div>
          </header>

          <div className="mt-6">
            <BiblicalNotesList notes={filteredNotes} booksBySlug={booksBySlug} />
          </div>
        </div>
      </div>
    </div>
  );
}
