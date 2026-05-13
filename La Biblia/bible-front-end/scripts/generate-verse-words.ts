import { PrismaClient } from "@prisma/client";
import { extractWordsFromVerseText } from "../lib/normalizeText";

const prisma = new PrismaClient();

async function main() {
  await prisma.verseWord.deleteMany();

  const take = 500;
  let skip = 0;

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
      skip,
      orderBy: [
        { book: { testament: "asc" } },
        { book: { order: "asc" } },
        { chapterNumber: "asc" },
        { verseNumber: "asc" },
      ],
      select: {
        translationId: true,
        bookId: true,
        chapterNumber: true,
        verseNumber: true,
        text: true,
      },
    });
    if (!verses.length) break;

    for (const v of verses) {
      const tokens = extractWordsFromVerseText(v.text);
      for (const { word, normalizedWord } of tokens) {
        batch.push({
          translationId: v.translationId,
          bookId: v.bookId,
          chapterNumber: v.chapterNumber,
          verseNumber: v.verseNumber,
          word,
          normalizedWord,
        });
        if (batch.length >= 2000) await flush();
      }
    }

    skip += take;
  }

  await flush();
  const count = await prisma.verseWord.count();
  console.log("VerseWord generation complete. Rows:", count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
