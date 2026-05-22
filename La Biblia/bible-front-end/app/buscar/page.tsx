import { BibleSearchClient } from "@/components/search/BibleSearchClient";
import { formatBookTitle } from "@/lib/formatTitle";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BuscarPage() {
  const [books, verseStats] = await Promise.all([
    prisma.book.findMany({
      include: {
        chapters: {
          select: { number: true },
          orderBy: { number: "asc" },
        },
      },
      orderBy: [{ testament: "asc" }, { order: "asc" }],
    }),
    prisma.verse.groupBy({
      by: ["bookId", "chapterNumber"],
      _max: { verseNumber: true },
    }),
  ]);

  const maxVerseByChapter = new Map(
    verseStats.map((row) => [
      `${row.bookId}:${row.chapterNumber}`,
      row._max.verseNumber ?? 0,
    ]),
  );

  const bookOptions = books.map((book) => ({
    slug: book.slug,
    title: formatBookTitle(book.nameEs),
    testament: book.testament,
    chapters: book.chapters.map((chapter) => ({
      number: chapter.number,
      verseCount: maxVerseByChapter.get(`${book.id}:${chapter.number}`) ?? 0,
    })),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-accent">Buscar en la Biblia</h1>
      <p className="text-ink-muted">
        Búsqueda de texto con Typesense; el conteo exacto de palabras usa la tabla{" "}
        <code className="rounded bg-paper-alt px-1">VerseWord</code> en PostgreSQL (tras{" "}
        <code className="rounded bg-paper-alt px-1">npm run verse-words</code>).
      </p>
      <BibleSearchClient books={bookOptions} />
    </div>
  );
}
