import { notFound, redirect } from "next/navigation";
import { BibleReaderClient } from "@/components/bible/BibleReaderClient";
import {
  getStaticBook,
  getStaticBooks,
  getStaticBookSummary,
  getStaticTranslation,
  getSupportedStaticLanguages,
  resolveStaticBookSlug,
} from "@/lib/staticBible";

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

  const canonicalSlug = resolveStaticBookSlug(bookSlug);
  if (canonicalSlug !== bookSlug) {
    const query = highlight ? `?highlight=${encodeURIComponent(highlight)}` : "";
    redirect(`/biblia/${language}/${canonicalSlug}/${chapterParam}${query}`);
  }

  const [translation, book] = await Promise.all([
    getStaticTranslation(language),
    getStaticBookSummary(language, canonicalSlug),
  ]);

  if (!translation || !book || !book.chapters.some((chapter) => chapter.number === chapterNumber)) {
    notFound();
  }

  const bookContent = await getStaticBook(language, canonicalSlug);

  return (
    <BibleReaderClient
      initialLanguage={language}
      initialBookSlug={canonicalSlug}
      initialChapter={chapterNumber}
      initialBook={bookContent}
      initialHighlight={highlight}
    />
  );
}
