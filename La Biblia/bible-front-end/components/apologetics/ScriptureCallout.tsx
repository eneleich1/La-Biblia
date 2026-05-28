"use client";

import Link from "next/link";
import { BookOpen, Quote } from "lucide-react";
import type { ScriptureItem } from "@/components/apologetics/types";
import { useMemo } from "react";
import { useSiteTheme } from "@/components/theme/ThemeProvider";
import { formatBibleReferenceLabel } from "@/lib/formatBibleReference";

type ScriptureCalloutProps = {
  title: string;
  scriptures: ScriptureItem[];
  quote?: string;
  books: { slug: string; nameEs: string }[];
};

export function ScriptureCallout({ title, scriptures, quote, books }: ScriptureCalloutProps) {
  const { bookTitleMode } = useSiteTheme();
  const booksBySlug = useMemo(
    () => new Map(books.map((book) => [book.slug, { slug: book.slug, nameEs: book.nameEs }])),
    [books],
  );
  return (
    <section className="rounded-lg border border-[var(--accent)]/30 bg-[#fbf7ef] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
        <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">{title}</h3>
      </div>
      <div className="mt-3 space-y-2.5">
        {scriptures.map((item) => (
          <article key={item.label} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
            {(() => {
              const label = item.href
                ? formatBibleReferenceLabel(item.label, item.href, null, booksBySlug, bookTitleMode)
                : item.label.replace(/^\[|\]$/g, "").trim();
              return item.href ? (
                <Link href={item.href} className="text-sm font-semibold text-[var(--accent)] hover:underline">
                  {label}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-[var(--accent)]">{label}</p>
              );
            })()}
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text)]/90">&ldquo;{item.text}&rdquo;</p>
          </article>
        ))}
      </div>
      {quote ? (
        <blockquote className="mt-3 rounded-md border border-[var(--accent)]/20 bg-[var(--surface)] px-3 py-3 text-sm leading-relaxed text-[var(--text-muted)]">
          <span className="mr-2 inline-flex align-middle text-[var(--accent)]">
            <Quote className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          {quote}
        </blockquote>
      ) : null}
    </section>
  );
}
