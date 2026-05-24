import { notFound } from "next/navigation";
import { AudioBookClient } from "@/components/audio/AudioBookClient";
import { getAudioLinksForBook } from "@/lib/audio";
import {
  getStaticAdjacentBooks,
  getStaticBooks,
  getStaticBookSummary,
  getStaticTranslation,
  getSupportedStaticLanguages,
} from "@/lib/staticBible";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const params = await Promise.all(
    getSupportedStaticLanguages().map(async (language) => {
      const books = await getStaticBooks(language);
      return books.flatMap((book) =>
        book.chapters.map((chapter) => ({
          language,
          bookSlug: book.slug,
          chapter: String(chapter.number),
        })),
      );
    }),
  );
  return params.flat();
}

export default async function AudioChapterPage({
  params,
}: {
  params: Promise<{ language: string; bookSlug: string; chapter: string }>;
}) {
  const { language, bookSlug, chapter: chapterParam } = await params;
  const chapterNumber = parseInt(chapterParam, 10);
  if (!Number.isFinite(chapterNumber) || chapterNumber < 1) notFound();

  const [translation, book] = await Promise.all([
    getStaticTranslation(language),
    getStaticBookSummary(language, bookSlug),
  ]);

  if (!translation || !book || !book.chapters.some((chapter) => chapter.number === chapterNumber)) {
    notFound();
  }

  const chapterNumbers = book.chapters.map((chapter) => chapter.number).sort((a, b) => a - b);
  const [links, adjacent] = await Promise.all([
    getAudioLinksForBook(language, bookSlug, chapterNumbers),
    getStaticAdjacentBooks(language, book.testament, book.order),
  ]);

  return (
    <AudioBookClient
      language={language}
      bookSlug={bookSlug}
      bookTitle={book.nameEs}
      chapterNumbers={chapterNumbers}
      initialChapter={chapterNumber}
      chapterLinks={links}
      prevBookSlug={adjacent.prevSlug}
      nextBookSlug={adjacent.nextSlug}
    />
  );
}
