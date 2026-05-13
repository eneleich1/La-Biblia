import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import path from "path";
import { normalizeText } from "../lib/normalizeText";

const prisma = new PrismaClient();

type JsonBook = {
  Title: string;
  Chapters: {
    Title: string;
    ShortTitle: string;
    Versicles: { Index: number; Text: string; VersicleNumber: number }[];
  }[];
};

type JsonRoot = { Title: string; Books: JsonBook[] };

type BookGroup = {
  Title: string;
  BookIndexes: number[];
  Testament: number;
};

function stripTitlePrefix(title: string) {
  return title.replace(/^\d+-\s*/, "").trim();
}

function slugify(raw: string, used: Set<string>) {
  let slug =
    normalizeText(raw)
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "") || "book";
  let candidate = slug;
  let n = 0;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${slug}-${n}`;
  }
  used.add(candidate);
  return candidate;
}

async function loadJson<T>(rel: string): Promise<T> {
  const p = path.join(process.cwd(), "data", "import", rel);
  const buf = await readFile(p, "utf-8");
  return JSON.parse(buf) as T;
}

async function main() {
  const [oldtest, newtest, bookConfigs] = await Promise.all([
    loadJson<JsonRoot>("antiguo-testamento.json"),
    loadJson<JsonRoot>("nuevo-testamento.json"),
    loadJson<{ BooksGroups: BookGroup[] }[]>("bookConfigs.json"),
  ]);

  const detailGroups = bookConfigs[1]?.BooksGroups ?? [];
  const categoryMap = new Map<string, string>();
  for (const g of detailGroups) {
    for (const idx of g.BookIndexes) {
      categoryMap.set(`${g.Testament}:${idx}`, g.Title);
    }
  }

  await prisma.$transaction([
    prisma.audioLink.deleteMany(),
    prisma.verseWord.deleteMany(),
    prisma.verse.deleteMany(),
    prisma.chapter.deleteMany(),
    prisma.book.deleteMany(),
    prisma.translation.deleteMany(),
  ]);

  const translation = await prisma.translation.create({
    data: {
      name: "La Biblia de Jerusalén",
      language: "es",
      abbreviation: "BJ1976",
      copyrightNote: "Edición de 1976 (imported text; verify rights in production).",
      isPublic: true,
    },
  });

  const usedSlugs = new Set<string>();
  let skippedEmptyVerses = 0;
  let jsonChaptersTotal = 0;
  let jsonVersesTotal = 0;

  async function importTestament(root: JsonRoot, testament: number) {
    let order = 0;
    for (const book of root.Books) {
      order += 1;
      const nameEs = stripTitlePrefix(book.Title);
      const slug = slugify(nameEs, usedSlugs);
      const category = categoryMap.get(`${testament}:${order}`) ?? null;

      const bookRow = await prisma.book.create({
        data: {
          testament,
          order,
          slug,
          nameEs,
          nameEn: null,
          category,
        },
      });

      const chapters = book.Chapters.map((_, i) => ({
        bookId: bookRow.id,
        number: i + 1,
      }));
      jsonChaptersTotal += chapters.length;
      await prisma.chapter.createMany({ data: chapters });

      const dbChapters = await prisma.chapter.findMany({
        where: { bookId: bookRow.id },
        orderBy: { number: "asc" },
        select: { id: true, number: true },
      });
      const chapterIdByNumber = new Map(dbChapters.map((c) => [c.number, c.id]));

      const verseBatch: {
        translationId: string;
        bookId: string;
        chapterId: string;
        chapterNumber: number;
        verseNumber: number;
        text: string;
        normalizedText: string;
      }[] = [];

      const flush = async () => {
        if (!verseBatch.length) return;
        await prisma.verse.createMany({ data: verseBatch });
        verseBatch.length = 0;
      };

      for (let ci = 0; ci < book.Chapters.length; ci++) {
        const ch = book.Chapters[ci];
        const chapterNumber = ci + 1;
        const chapterId = chapterIdByNumber.get(chapterNumber);
        if (!chapterId) {
          throw new Error(
            `Missing Chapter row for book "${nameEs}" (${slug}) chapter ${chapterNumber}`,
          );
        }

        for (const v of ch.Versicles) {
          const verseNumber = v.VersicleNumber ?? v.Index;
          const text = v.Text.trim();
          if (!text) {
            skippedEmptyVerses += 1;
            continue;
          }
          jsonVersesTotal += 1;
          verseBatch.push({
            translationId: translation.id,
            bookId: bookRow.id,
            chapterId,
            chapterNumber,
            verseNumber,
            text,
            normalizedText: normalizeText(text),
          });
          if (verseBatch.length >= 400) await flush();
        }
      }
      await flush();
    }
  }

  await importTestament(oldtest, 1);
  await importTestament(newtest, 2);

  const [dbBooks, dbChapters, dbVerses] = await Promise.all([
    prisma.book.count(),
    prisma.chapter.count(),
    prisma.verse.count(),
  ]);

  const expectedBooks = oldtest.Books.length + newtest.Books.length;

  console.log(
    JSON.stringify(
      {
        translationId: translation.id,
        language: translation.language,
        expectedBooks,
        dbBooks,
        jsonChaptersTotal,
        dbChapters,
        jsonVersesTotal,
        dbVerses,
        skippedEmptyVerses,
        ok:
          expectedBooks === dbBooks &&
          jsonChaptersTotal === dbChapters &&
          jsonVersesTotal === dbVerses,
      },
      null,
      2,
    ),
  );

  if (expectedBooks !== dbBooks || jsonChaptersTotal !== dbChapters || jsonVersesTotal !== dbVerses) {
    console.error("Import sanity check failed: counts do not match JSON source.");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
