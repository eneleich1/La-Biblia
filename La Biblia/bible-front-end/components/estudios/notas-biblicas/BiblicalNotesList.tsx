"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSiteTheme } from "@/components/theme/ThemeProvider";
import { getNoteRowIcon } from "@/lib/bibleNoteIcons";
import { formatBibleReferenceLabel } from "@/lib/formatBibleReference";
import type { BiblicalNote, TestamentKey } from "@/lib/parseBiblicalNotes";

type BookLookup = { slug: string; nameEs: string };

type Props = {
  notes: BiblicalNote[];
  booksBySlug: Map<string, BookLookup>;
};

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="font-serif-display text-xl leading-none text-[var(--accent)]" aria-hidden>
        ~
      </span>
      <h2 className="shrink-0 font-serif-display text-2xl font-semibold leading-none text-[var(--text)]">
        {title}
      </h2>
      <span className="font-serif-display text-xl leading-none text-[var(--accent)]" aria-hidden>
        ~
      </span>
      <div className="h-px min-w-0 flex-1 bg-[var(--border)]" aria-hidden />
    </div>
  );
}

function NoteRow({
  note,
  booksBySlug,
}: {
  note: BiblicalNote;
  booksBySlug: Map<string, BookLookup>;
}) {
  const Icon = getNoteRowIcon(note.bookSlug);
  const { bookTitleMode } = useSiteTheme();
  const reference = formatBibleReferenceLabel(
    note.referenceLabel,
    note.href,
    note.bookSlug,
    booksBySlug,
    bookTitleMode,
  );

  return (
    <li>
      <Link
        href={note.href}
        target={note.isExternal ? "_blank" : undefined}
        rel={note.isExternal ? "noreferrer" : undefined}
        className="group grid min-h-10 grid-cols-[2.7rem_minmax(0,1fr)] items-center gap-2 border-b border-[var(--border)] px-3 py-1.5 text-[var(--text)] transition last:border-b-0 hover:bg-[var(--surface-muted)] sm:grid-cols-[2.7rem_minmax(0,1fr)_auto_1.35rem]"
      >
        <span className="flex h-7 w-7 items-center justify-center justify-self-center text-[var(--accent)]">
          <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden />
        </span>
        <span className="min-w-0 text-sm leading-snug sm:text-[15px]">{note.text}</span>
        <span className="mt-1 w-fit rounded-md border border-[var(--accent)]/25 bg-[var(--surface)] px-2.5 py-1 font-serif-display text-xs font-semibold leading-none text-[var(--accent)] transition group-hover:border-[var(--accent)]/45 sm:mt-0 sm:text-sm">
          {reference}
        </span>
        <ChevronRight
          className="hidden h-4 w-4 justify-self-end text-[var(--accent)]/80 transition group-hover:translate-x-0.5 sm:block"
          strokeWidth={2}
          aria-hidden
        />
      </Link>
    </li>
  );
}

function TestamentSection({
  title,
  notes,
  booksBySlug,
}: {
  title: string;
  notes: BiblicalNote[];
  booksBySlug: Map<string, BookLookup>;
}) {
  if (!notes.length) return null;

  return (
    <section className="mt-3 first:mt-0">
      <SectionDivider title={title} />
      <ul className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_34px_-32px_rgba(70,50,24,0.48)]">
        {notes.map((note) => (
          <NoteRow key={note.id} note={note} booksBySlug={booksBySlug} />
        ))}
      </ul>
    </section>
  );
}

export function BiblicalNotesList({ notes, booksBySlug }: Props) {
  const notesByTestament = notes.reduce<Record<TestamentKey, BiblicalNote[]>>(
    (groups, note) => {
      groups[note.testament].push(note);
      return groups;
    },
    { ot: [], nt: [] },
  );

  if (!notes.length) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
        No hay notas para este filtro.
      </p>
    );
  }

  return (
    <div>
      <TestamentSection
        title="Antiguo Testamento"
        notes={notesByTestament.ot}
        booksBySlug={booksBySlug}
      />
      <TestamentSection
        title="Nuevo Testamento"
        notes={notesByTestament.nt}
        booksBySlug={booksBySlug}
      />
      <p className="mt-5 text-center text-sm font-medium text-[var(--accent)]/80">
        <span aria-hidden>~</span>{" "}
        <span className="text-[var(--text-muted)]">Hay más notas para explorar</span>{" "}
        <span aria-hidden>~</span>
      </p>
    </div>
  );
}
