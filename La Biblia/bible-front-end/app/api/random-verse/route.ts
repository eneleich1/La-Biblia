import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function pick<T>(items: T[]): T | null {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export async function GET() {
  const translation = await prisma.translation.findFirst({
    where: { language: "es", isPublic: true },
    select: { id: true },
  });

  if (!translation) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  const testament = pick([1, 2]);
  if (!testament) {
    return NextResponse.json({ error: "Testament not found" }, { status: 404 });
  }

  const books = await prisma.book.findMany({
    where: { testament },
    orderBy: { order: "asc" },
    select: { id: true, nameEs: true, slug: true },
  });
  const book = pick(books);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const chapters = await prisma.chapter.findMany({
    where: { bookId: book.id },
    orderBy: { number: "asc" },
    select: { id: true, number: true },
  });
  const chapter = pick(chapters);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const verses = await prisma.verse.findMany({
    where: {
      translationId: translation.id,
      bookId: book.id,
      chapterId: chapter.id,
    },
    orderBy: { verseNumber: "asc" },
    select: { verseNumber: true, text: true },
  });
  const verse = pick(verses);
  if (!verse) {
    return NextResponse.json({ error: "Verse not found" }, { status: 404 });
  }

  return NextResponse.json({
    reference: `${book.nameEs} ${chapter.number}:${verse.verseNumber}`,
    text: verse.text,
    href: `/biblia/es/${book.slug}/${chapter.number}?highlight=${verse.verseNumber}#V${verse.verseNumber}`,
  });
}
