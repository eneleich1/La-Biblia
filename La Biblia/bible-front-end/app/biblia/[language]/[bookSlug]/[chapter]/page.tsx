import { notFound } from "next/navigation";
import { BibleReaderClient } from "@/components/bible/BibleReaderClient";
import {
  getStaticBook,
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

  const [translation, book, bookContent] = await Promise.all([
    getStaticTranslation(language),
    getStaticBookSummary(language, bookSlug),
    getStaticBook(language, bookSlug),
  ]);

  if (!translation || !book || !book.chapters.some((chapter) => chapter.number === chapterNumber)) {
    notFound();
  }

  return (
    <BibleReaderClient
      initialLanguage={language}
      initialBookSlug={bookSlug}
      initialChapter={chapterNumber}
      initialBook={bookContent}
      initialHighlight={highlight}
    />
  );
}
