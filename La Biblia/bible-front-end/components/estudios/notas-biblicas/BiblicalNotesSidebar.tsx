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
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-muted)]"
        aria-expanded={expanded}
      >
        <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.55} aria-hidden />
        <span className="min-w-0 flex-1 text-sm font-medium text-[var(--text)]">{category.label}</span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-[var(--accent)] transition ${expanded ? "rotate-90" : ""}`}
          aria-hidden
        />
      </button>
      {expanded && categoryBooks.length > 0 ? (
        <ul className="space-y-0.5 border-t border-[var(--border)] bg-[var(--surface-muted)]/70 px-3 py-2">
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
        <p className="border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--text-muted)]">
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
    <aside className="w-full shrink-0 lg:w-[19rem]">
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_36px_-32px_rgba(70,50,24,0.55)]">
        <div className="space-y-2 border-b border-[var(--border)] p-5">
          {(Object.keys(testamentSidebarMeta) as TestamentKey[]).map((key) => {
            const meta = testamentSidebarMeta[key];
            const Icon = meta.icon;
            const isActive = activeTestament === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTestamentChange(key)}
                className={`relative flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-[var(--surface-muted)] text-[var(--text)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r before:bg-[var(--accent)]"
                    : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.55} aria-hidden />
                <span className="text-sm font-semibold">{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-5 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {sectionLabel}
          </p>
        </div>

        <div className="mt-2 px-3">
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

        <div className="mt-3 border-t border-[var(--border)] p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Navegación rápida
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {quickNavLetters.map((letter) => {
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => onLetterChange(isActive ? null : letter)}
                  className={`flex h-7 items-center justify-center rounded-md border text-[12px] font-semibold transition ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:border-[var(--accent)]/35 hover:bg-[var(--surface-muted)]"
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
