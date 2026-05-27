import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const translation = await prisma.translation.findFirst({
    where: { language: "es", isPublic: true },
    select: { id: true },
  });

  if (!translation) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  const where = { translationId: translation.id };
  const verseCount = await prisma.verse.count({ where });

  if (!verseCount) {
    return NextResponse.json({ error: "Verse not found" }, { status: 404 });
  }

  const verse = await prisma.verse.findFirst({
    where,
    skip: Math.floor(Math.random() * verseCount),
    orderBy: { id: "asc" },
    select: {
      chapterNumber: true,
      verseNumber: true,
      text: true,
      book: {
        select: {
          nameEs: true,
          slug: true,
        },
      },
    },
  });

  if (!verse) {
    return NextResponse.json({ error: "Verse not found" }, { status: 404 });
  }

  return NextResponse.json({
    reference: `${verse.book.nameEs} ${verse.chapterNumber}:${verse.verseNumber}`,
    text: verse.text,
    href: `/biblia/es/${verse.book.slug}/${verse.chapterNumber}?highlight=${verse.verseNumber}#V${verse.verseNumber}`,
  });
}
