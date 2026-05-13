import { PrismaClient } from "@prisma/client";
import { normalizeText, tokenizeNormalized } from "../lib/normalizeText";

const prisma = new PrismaClient();

async function main() {
  await prisma.verseWord.deleteMany();

  const take = 500;
  let cursor: string | undefined;

  const batch: {
    translationId: string;
    bookId: string;
    chapterNumber: number;
    verseNumber: number;
    word: string;
    normalizedWord: string;
  }[] = [];

  const flush = async () => {
    if (!batch.length) return;
    await prisma.verseWord.createMany({ data: batch });
    batch.length = 0;
  };

  for (;;) {
    const verses = await prisma.verse.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: "asc" },
      select: {
        id: true,
        translationId: true,
        bookId: true,
        chapterNumber: true,
        verseNumber: true,
        normalizedText: true,
      },
    });
    if (!verses.length) break;

    for (const v of verses) {
      const tokens = tokenizeNormalized(v.normalizedText);
      for (const t of tokens) {
        const normalizedWord = normalizeText(t);
        if (!normalizedWord) continue;
        batch.push({
          translationId: v.translationId,
          bookId: v.bookId,
          chapterNumber: v.chapterNumber,
          verseNumber: v.verseNumber,
          word: t,
          normalizedWord,
        });
        if (batch.length >= 2000) await flush();
      }
    }

    cursor = verses[verses.length - 1].id;
    if (verses.length < take) break;
  }

  await flush();
  console.log("VerseWord generation complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
