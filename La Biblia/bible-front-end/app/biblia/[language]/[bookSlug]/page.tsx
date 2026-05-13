import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdjacentBooks, getBookBySlug, getTestamentBookCounts } from "@/lib/bible";
import { formatBookTitle } from "@/lib/formatTitle";

export const dynamic = "force-dynamic";

function padChapter(n: number) {
  return String(n).padStart(2, "0");
}

export default async function BookChaptersPage({
  params,
}: {
  params: Promise<{ language: string; bookSlug: string }>;
}) {
  const { language, bookSlug } = await params;

  const translation = await prisma.translation.findFirst({
    where: { language, isPublic: true },
  });
  if (!translation) notFound();

  const book = await getBookBySlug(bookSlug);
  if (!book) notFound();

  const count = await prisma.chapter.count({ where: { bookId: book.id } });
  const { otLast, ntLast } = await getTestamentBookCounts();
  const { prevSlug, nextSlug } = await getAdjacentBooks(
    book.testament,
    book.order,
    otLast,
    ntLast,
  );

  const indexes = Array.from({ length: count }, (_, i) => i + 1);
  const displayTitle = formatBookTitle(book.nameEs.toLocaleLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
        >
          Inicio
        </Link>
        <Link
          href={`/biblia/${language}`}
          className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
        >
          Biblia
        </Link>
        {prevSlug && (
          <Link
            href={`/biblia/${language}/${prevSlug}`}
            className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
          >
            ← Libro anterior
          </Link>
        )}
        {nextSlug && (
          <Link
            href={`/biblia/${language}/${nextSlug}`}
            className="rounded-lg border border-accent-soft bg-white px-3 py-1.5 text-sm hover:bg-paper-alt"
          >
            Libro siguiente →
          </Link>
        )}
      </div>

      <h1 className="text-2xl font-semibold capitalize text-accent">{displayTitle}</h1>

      <div className="flex flex-wrap gap-2">
        {indexes.map((i) => (
          <Link
            key={i}
            href={`/biblia/${language}/${bookSlug}/${i}`}
            className="inline-flex min-w-[3rem] justify-center rounded-lg border border-accent-soft bg-white px-2 py-2 text-sm font-medium hover:border-accent"
          >
            {padChapter(i)}
          </Link>
        ))}
      </div>
    </div>
  );
}
