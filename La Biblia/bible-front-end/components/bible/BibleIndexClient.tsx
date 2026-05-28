"use client";

import Link from "next/link";
import {
  formatBibleBookTitle,
  formatBookTitleWithRomanAfterDash,
} from "@/lib/formatTitle";
import { useSiteTheme, type BibleIndexMode } from "@/components/theme/ThemeProvider";
import type { BookTitleMode } from "@/lib/formatTitle";

type Book = {
  slug: string;
  nameEs: string;
  category: string | null;
  testament: number;
  order: number;
  chapters?: { number: number }[];
};

type Group = {
  title: string;
  books: { slug: string; title: string; order: number }[];
};

function buildGroups(
  books: Book[],
  mode: BibleIndexMode,
  titleMode: BookTitleMode,
): { ot: Group[]; nt: Group[] } {
  if (mode === "natural") {
    return {
      ot: [
        {
          title: "Antiguo Testamento",
          books: books
            .filter((b) => b.testament === 1)
            .map((b) => ({
              slug: b.slug,
              title: formatBibleBookTitle(b.nameEs, b.slug, titleMode),
              order: b.order,
            })),
        },
      ],
      nt: [
        {
          title: "Nuevo Testamento",
          books: books
            .filter((b) => b.testament === 2)
            .map((b) => ({
              slug: b.slug,
              title: formatBibleBookTitle(b.nameEs, b.slug, titleMode),
              order: b.order,
            })),
        },
      ],
    };
  }

  const otMap = new Map<string, Group>();
  const ntMap = new Map<string, Group>();

  for (const b of books) {
    const map = b.testament === 1 ? otMap : ntMap;
    const key = b.category ?? (b.testament === 1 ? "Antiguo Testamento" : "Nuevo Testamento");
    if (!map.has(key)) map.set(key, { title: key, books: [] });
    map.get(key)!.books.push({
      slug: b.slug,
      title: formatBibleBookTitle(b.nameEs, b.slug, titleMode),
      order: b.order,
    });
  }

  return {
    ot: [...otMap.values()],
    nt: [...ntMap.values()],
  };
}

function bookHref(language: string, slug: string, variant: "read" | "audio") {
  return variant === "audio"
    ? `/audio/${language}/${slug}/1`
    : `/biblia/${language}/${slug}/1`;
}

function TestamentPage({
  title,
  groups,
  language,
  variant,
}: {
  title: string;
  groups: Group[];
  language: string;
  variant: "read" | "audio";
}) {
  return (
    <section className="scripture-book-page">
      <div className="scripture-book-page-content">
        <div className="scripture-flourish" aria-hidden>
          <span />
        </div>
        <h2 className="scripture-testament-title">{title}</h2>
        <div className="scripture-title-rule" aria-hidden />
        <div className="scripture-group-stack">
          {groups.map((g) => (
            <div key={g.title} className="scripture-index-group">
              {g.title !== title && <h3>{formatBookTitleWithRomanAfterDash(g.title)}</h3>}
              <ul>
                {[...g.books].sort((a, b) => a.order - b.order).map((b) => (
                  <li key={b.slug}>
                    <Link href={bookHref(language, b.slug, variant)}>
                      <span className="scripture-book-number">
                        {String(b.order).padStart(2, "0")}.
                      </span>
                      <span>{b.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BibleIndexClient({
  books,
  language,
  variant = "read",
}: {
  books: Book[];
  language: string;
  variant?: "read" | "audio";
}) {
  const { bookTitleMode, bibleIndexMode } = useSiteTheme();
  const { ot, nt } = buildGroups(books, bibleIndexMode, bookTitleMode);

  return (
    <div className="scripture-book-frame">
      <div
        className={[
          "scripture-open-book",
          "scripture-open-book-index",
          bibleIndexMode === "natural"
            ? "scripture-open-book-natural"
            : "scripture-open-book-grouped",
          bookTitleMode === "long"
            ? "scripture-open-book-titles-long"
            : "scripture-open-book-titles-short",
        ].join(" ")}
      >
        <TestamentPage
          title="Antiguo Testamento"
          groups={ot}
          language={language}
          variant={variant}
        />
        <TestamentPage
          title="Nuevo Testamento"
          groups={nt}
          language={language}
          variant={variant}
        />
      </div>
    </div>
  );
}
