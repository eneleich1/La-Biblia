import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBookTitle } from "@/lib/formatTitle";

export const dynamic = "force-dynamic";

export default async function ChapterReadPage({
  params,
}: {
  params: Promise<{ language: string; bookSlug: string; chapter: string }>;
}) {
  const { language, bookSlug, chapter: chapterParam } = await params;
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

  const verses = await prisma.verse.findMany({
    where: {
      translationId: translation.id,
      bookId: book.id,
      chapterNumber,
    },
    orderBy: { verseNumber: "asc" },
  });

  const totalChapters = await prisma.chapter.count({ where: { bookId: book.id } });

  const heading = `${formatBookTitle(book.nameEs.toLocaleLowerCase())} ${chapterNumber}`;
  const half = Math.ceil(verses.length / 2);
  const left = verses.slice(0, half);
  const right = verses.slice(half);

  const Nav = () => (
    <div className="flex flex-wrap gap-2 py-3">
      <Link
        href="/"
        className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
      >
        Inicio
      </Link>
      <Link
        href={`/biblia/${language}/${bookSlug}`}
        className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
      >
        Capítulos
      </Link>
      {chapterNumber > 1 && (
        <Link
          href={`/biblia/${language}/${bookSlug}/${chapterNumber - 1}`}
          className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
        >
          ← Capítulo anterior
        </Link>
      )}
      {chapterNumber < totalChapters && (
        <Link
          href={`/biblia/${language}/${bookSlug}/${chapterNumber + 1}`}
          className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
        >
          Capítulo siguiente →
        </Link>
      )}
    </div>
  );

  const VerseCol = ({ list }: { list: typeof verses }) => (
    <div className="space-y-3 text-[1.05rem] leading-relaxed">
      {list.map((v) => (
        <p key={v.id} id={`V${v.verseNumber}`} className="scroll-mt-24">
          <span className="me-2 font-semibold text-accent">{v.verseNumber}</span>
          {v.text}
        </p>
      ))}
    </div>
  );

  return (
    <article>
      <Nav />
      <h1 className="mb-8 text-center text-2xl font-semibold text-accent">{heading}</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <VerseCol list={left} />
        <VerseCol list={right} />
      </div>
      <Nav />
    </article>
  );
}
