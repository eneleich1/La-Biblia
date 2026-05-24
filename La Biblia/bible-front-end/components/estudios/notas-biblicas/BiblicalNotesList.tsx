"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getNoteRowIcon } from "@/lib/bibleNoteIcons";
import { formatBibleReferenceLabel } from "@/lib/formatBibleReference";
import type { BiblicalNote, TestamentKey } from "@/lib/parseBiblicalNotes";

type BookLookup = { slug: string; nameEs: string };

type Props = {
  notes: BiblicalNote[];
  testament: TestamentKey;
  booksBySlug: Map<string, BookLookup>;
};

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="text-[var(--accent)]/70" aria-hidden>
        ~~~
      </span>
      <h2 className="shrink-0 font-serif-display text-lg font-semibold text-[var(--text)]">{title}</h2>
      <span className="text-[var(--accent)]/70" aria-hidden>
        ~~~
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
  const reference = formatBibleReferenceLabel(note.referenceLabel, note.bookSlug, booksBySlug);

  return (
    <li className="group flex items-center gap-3 border-b border-[var(--border)] py-3.5 last:border-b-0 sm:gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-4 w-4" strokeWidth={1.65} aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-sm leading-snug text-[var(--text)] sm:text-[15px]">{note.text}</p>
      <Link
        href={note.href}
        target={note.isExternal ? "_blank" : undefined}
        rel={note.isExternal ? "noreferrer" : undefined}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)] sm:text-sm"
      >
        {reference}
        <ChevronRight className="h-3.5 w-3.5 opacity-60" strokeWidth={2} aria-hidden />
      </Link>
    </li>
  );
}

export function BiblicalNotesList({ notes, testament, booksBySlug }: Props) {
  const sectionTitle = testament === "ot" ? "Antiguo Testamento" : "Nuevo Testamento";

  if (!notes.length) {
    return (
      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
        No hay notas para este filtro.
      </p>
    );
  }

  return (
    <div>
      <SectionDivider title={sectionTitle} />
      <ul className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5">
        {notes.map((note) => (
          <NoteRow key={note.id} note={note} booksBySlug={booksBySlug} />
        ))}
      </ul>
      <p className="mt-6 text-center text-sm italic text-[var(--text-muted)]">
        <span className="text-[var(--accent)]/60" aria-hidden>
          ~~~
        </span>{" "}
        Hay más notas para explorar{" "}
        <span className="text-[var(--accent)]/60" aria-hidden>
          ~~~
        </span>
      </p>
    </div>
  );
}
