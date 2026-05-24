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
      <h1 className="page-title">Buscar en la Biblia</h1>
      <BibleSearchClient books={bookOptions} />
    </div>
  );
}
