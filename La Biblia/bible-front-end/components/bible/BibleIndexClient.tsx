"use client";

import Link from "next/link";
import { formatBookTitleWithRomanAfterDash } from "@/lib/formatTitle";
import { useSiteTheme, type BibleIndexMode } from "@/components/theme/ThemeProvider";

type Book = {
  slug: string;
  nameEs: string;
  category: string | null;
  testament: number;
  order: number;
};

type Group = { title: string; books: { slug: string; title: string; order: number }[] };

function buildGroups(books: Book[], mode: BibleIndexMode): { ot: Group[]; nt: Group[] } {
  if (mode === "natural") {
    return {
      ot: [
        {
          title: "Antiguo Testamento",
          books: books
            .filter((b) => b.testament === 1)
            .map((b) => ({
              slug: b.slug,
              title: formatBookTitleWithRomanAfterDash(b.nameEs),
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
              title: formatBookTitleWithRomanAfterDash(b.nameEs),
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
      title: formatBookTitleWithRomanAfterDash(b.nameEs),
      order: b.order,
    });
  }

  return {
    ot: [...otMap.values()],
    nt: [...ntMap.values()],
  };
}

function TestamentPage({
  title,
  groups,
  language,
}: {
  title: string;
  groups: Group[];
  language: string;
}) {
  return (
    <section className="scripture-book-page">
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
                  <Link href={`/biblia/${language}/${b.slug}`}>
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
    </section>
  );
}

export function BibleIndexClient({
  books,
  language,
}: {
  books: Book[];
  language: string;
}) {
  const { bibleIndexMode } = useSiteTheme();
  const { ot, nt } = buildGroups(books, bibleIndexMode);

  return (
    <div
      className={`scripture-open-book scripture-open-book-index ${
        bibleIndexMode === "natural" ? "scripture-open-book-natural" : ""
      }`}
    >
      <TestamentPage title="Antiguo Testamento" groups={ot} language={language} />
      <TestamentPage title="Nuevo Testamento" groups={nt} language={language} />
    </div>
  );
}
