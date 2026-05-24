"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  BIBLE_LANGUAGE,
  booksForCategory,
  ntSidebarCategories,
  otSidebarCategories,
  quickNavLetters,
  testamentSidebarMeta,
  type BibleBookRow,
  type SidebarCategory,
} from "@/data/bibleNoteSidebar";
import type { TestamentKey } from "@/lib/parseBiblicalNotes";

type Props = {
  books: BibleBookRow[];
  activeTestament: TestamentKey;
  onTestamentChange: (testament: TestamentKey) => void;
  expandedCategoryId: string | null;
  onToggleCategory: (id: string) => void;
  activeLetter: string | null;
  onLetterChange: (letter: string | null) => void;
};

function CategoryBlock({
  category,
  books,
  expanded,
  onToggle,
}: {
  category: SidebarCategory;
  books: BibleBookRow[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = category.icon;
  const categoryBooks = booksForCategory(books, category);

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[var(--background-soft)]"
        aria-expanded={expanded}
      >
        <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
        <span className="min-w-0 flex-1 text-sm font-medium text-[var(--text)]">{category.label}</span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition ${expanded ? "rotate-90" : ""}`}
          aria-hidden
        />
      </button>
      {expanded && categoryBooks.length > 0 ? (
        <ul className="space-y-0.5 border-t border-[var(--border)] bg-[var(--background-soft)]/60 px-2 py-2">
          {categoryBooks.map((book) => (
            <li key={book.slug}>
              <Link
                href={`/biblia/${BIBLE_LANGUAGE}/${book.slug}`}
                className="block rounded-md px-3 py-1.5 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--accent)]"
              >
                {book.nameEs}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {expanded && categoryBooks.length === 0 ? (
        <p className="border-t border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)]">
          No hay libros importados en esta categoría.
        </p>
      ) : null}
    </div>
  );
}

export function BiblicalNotesSidebar({
  books,
  activeTestament,
  onTestamentChange,
  expandedCategoryId,
  onToggleCategory,
  activeLetter,
  onLetterChange,
}: Props) {
  const categories = activeTestament === "ot" ? otSidebarCategories : ntSidebarCategories;
  const sectionLabel =
    activeTestament === "ot"
      ? "Ir a libros del Antiguo Testamento"
      : "Ir a libros del Nuevo Testamento";

  return (
    <aside className="w-full shrink-0 lg:w-[17.5rem] xl:w-[18.5rem]">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <div className="space-y-2 border-b border-[var(--border)] p-3">
          {(Object.keys(testamentSidebarMeta) as TestamentKey[]).map((key) => {
            const meta = testamentSidebarMeta[key];
            const Icon = meta.icon;
            const isActive = activeTestament === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTestamentChange(key)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                  isActive
                    ? "border-[var(--accent)]/35 bg-[var(--surface-muted)] text-[var(--text)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/25"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.6} aria-hidden />
                <span className="text-sm font-semibold">{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-3 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {sectionLabel}
          </p>
        </div>

        <div className="mt-1">
          {categories.map((category) => (
            <CategoryBlock
              key={category.id}
              category={category}
              books={books}
              expanded={expandedCategoryId === category.id}
              onToggle={() => onToggleCategory(category.id)}
            />
          ))}
        </div>

        <div className="border-t border-[var(--border)] p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Navegación rápida
          </p>
          <div className="grid grid-cols-7 gap-1">
            {quickNavLetters.map((letter) => {
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => onLetterChange(isActive ? null : letter)}
                  className={`flex h-7 items-center justify-center rounded border text-[11px] font-semibold transition ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/30 hover:text-[var(--text)]"
                  }`}
                  aria-pressed={isActive}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
