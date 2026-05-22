import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAdjacentBooks, getTestamentBookCounts } from "@/lib/bible";
import { formatBookTitle } from "@/lib/formatTitle";

export const dynamic = "force-dynamic";

export default async function ChapterReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ language: string; bookSlug: string; chapter: string }>;
  searchParams: Promise<{ highlight?: string }>;
}) {
  const { language, bookSlug, chapter: chapterParam } = await params;
  const { highlight } = await searchParams;
  const chapterNumber = parseInt(chapterParam, 10);
  if (!Number.isFinite(chapterNumber) || chapterNumber < 1) notFound();

  const translation = await prisma.translation.findFirst({
    where: { language, isPublic: true },
  });
  if (!translation) notFound();

  const book = await prisma.book.findUnique({ where: { slug: bookSlug } });
  if (!book) notFound();

  const chapterRow = await prisma.chapter.findUnique({
    where: { bookId_number: { bookId: book.id, number: chapterNumber } },
  });
  if (!chapterRow) notFound();

  const [verses, chapters, testamentCounts] = await Promise.all([
    prisma.verse.findMany({
      where: {
        translationId: translation.id,
        bookId: book.id,
        chapterNumber,
      },
      orderBy: { verseNumber: "asc" },
    }),
    prisma.chapter.findMany({
      where: { bookId: book.id },
      select: { number: true },
      orderBy: { number: "asc" },
    }),
    getTestamentBookCounts(),
  ]);

  const { prevSlug, nextSlug } = await getAdjacentBooks(
    book.testament,
    book.order,
    testamentCounts.otLast,
    testamentCounts.ntLast,
  );

  const totalChapters = chapters.length;
  const bookTitle = formatBookTitle(book.nameEs);
  const highlightParts = (highlight ?? "")
    .split("-")
    .map((part) => parseInt(part, 10))
    .filter((part) => Number.isFinite(part) && part > 0);
  const highlightStart = highlightParts[0] ?? null;
  const highlightEnd = highlightParts[1] ?? highlightStart;
  const half = Math.ceil(verses.length / 2);
  const left = verses.slice(0, half);
  const right = verses.slice(half);

  const VerseCol = ({ list, firstPage }: { list: typeof verses; firstPage?: boolean }) => (
    <div className="scripture-verse-column">
      <div className="scripture-page-mark" aria-hidden>
        <span />
      </div>
      {list.map((v, index) => {
        const isHighlighted =
          highlightStart !== null &&
          highlightEnd !== null &&
          v.verseNumber >= highlightStart &&
          v.verseNumber <= highlightEnd;

        return (
          <p
            key={v.id}
            id={`V${v.verseNumber}`}
            className={[
              "scripture-verse",
              isHighlighted ? "scripture-highlighted" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="scripture-verse-number">{v.verseNumber}</span>
            <span className="scripture-verse-text">{v.text}</span>
          </p>
        );
      })}
    </div>
  );

  return (
    <article className="scripture-reader-shell">
      <div className="scripture-reader-layout">
        <aside className="scripture-reader-aside" aria-label="Navegacion del libro">
          <div className="scripture-reader-aside-card">
            <Link href={`/biblia/${language}`} className="scripture-back-link">
              Inicio
            </Link>
            <div className="scripture-aside-title-block">
              <p className="scripture-aside-kicker">Libro</p>
              <div className="scripture-aside-title-row">
                <h2>{bookTitle}</h2>
                <div className="scripture-aside-actions" aria-label="Navegacion de capitulos">
                  {chapterNumber > 1 ? (
                    <Link
                      href={`/biblia/${language}/${bookSlug}/${chapterNumber - 1}`}
                      aria-label="Capitulo anterior"
                      title="Capitulo anterior"
                    >
                      <ArrowLeft aria-hidden />
                    </Link>
                  ) : (
                    <span aria-label="Capitulo anterior no disponible" title="Capitulo anterior">
                      <ArrowLeft aria-hidden />
                    </span>
                  )}
                  {chapterNumber < totalChapters ? (
                    <Link
                      href={`/biblia/${language}/${bookSlug}/${chapterNumber + 1}`}
                      aria-label="Capitulo siguiente"
                      title="Capitulo siguiente"
                    >
                      <ArrowRight aria-hidden />
                    </Link>
                  ) : (
                    <span aria-label="Capitulo siguiente no disponible" title="Capitulo siguiente">
                      <ArrowRight aria-hidden />
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="scripture-chapter-grid" aria-label="Capitulos">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.number}
                  href={`/biblia/${language}/${bookSlug}/${chapter.number}`}
                  aria-current={chapter.number === chapterNumber ? "page" : undefined}
                >
                  {String(chapter.number).padStart(2, "0")}
                </Link>
              ))}
            </div>
            <div className="scripture-book-rail">
              {prevSlug ? (
                <Link
                  href={`/biblia/${language}/${prevSlug}/1`}
                  aria-label="Libro anterior"
                  title="Libro anterior"
                >
                  <ChevronsLeft aria-hidden />
                </Link>
              ) : null}
              {nextSlug ? (
                <Link
                  href={`/biblia/${language}/${nextSlug}/1`}
                  aria-label="Libro siguiente"
                  title="Libro siguiente"
                >
                  <ChevronsRight aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="scripture-reader-main">
          <header className="scripture-chapter-heading">
            <div className="scripture-flourish" aria-hidden>
              <span />
            </div>
            <h1>{bookTitle}</h1>
            <p>
              <span aria-hidden />
              Capitulo {chapterNumber}
              <span aria-hidden />
            </p>
          </header>

          <div className="scripture-open-book scripture-reader-book">
            <section className="scripture-reading-page">
              <VerseCol list={left} firstPage />
            </section>
            <section className="scripture-reading-page">
              <VerseCol list={right} />
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
