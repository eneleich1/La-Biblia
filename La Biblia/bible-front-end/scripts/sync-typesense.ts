import { PrismaClient } from "@prisma/client";
import { getTypesenseClient, VERSES_COLLECTION } from "../lib/typesense";
import { getPublicSiteBase } from "../lib/siteUrl";

const prisma = new PrismaClient();

const schema = {
  name: VERSES_COLLECTION,
  fields: [
    { name: "id", type: "string" as const },
    { name: "translationId", type: "string" as const, facet: true },
    { name: "language", type: "string" as const, facet: true },
    { name: "testament", type: "int32" as const, facet: true },
    { name: "bookId", type: "string" as const, facet: true },
    { name: "bookSlug", type: "string" as const, facet: true },
    { name: "bookName", type: "string" as const, optional: true },
    { name: "chapterNumber", type: "int32" as const, facet: true },
    { name: "verseNumber", type: "int32" as const },
    { name: "text", type: "string" as const },
    { name: "normalizedText", type: "string" as const },
    { name: "reference", type: "string" as const, optional: true },
    { name: "url", type: "string" as const, optional: true },
  ],
};

async function main() {
  const client = getTypesenseClient();
  const site = getPublicSiteBase();

  try {
    await client.collections(VERSES_COLLECTION).delete();
  } catch {
    // collection may not exist
  }

  await client.collections().create(schema);

  const take = 500;
  let skip = 0;
  const importBatch: Record<string, unknown>[] = [];
  let imported = 0;

  const pushBatch = async () => {
    if (!importBatch.length) return;
    await client
      .collections(VERSES_COLLECTION)
      .documents()
      .import(importBatch, { action: "upsert" });
    imported += importBatch.length;
    importBatch.length = 0;
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
      include: {
        book: true,
        translation: true,
      },
    });
    if (!verses.length) break;

    for (const v of verses) {
      const reference = `${v.book.nameEs} ${v.chapterNumber}:${v.verseNumber}`;
      const url = `${site}/biblia/${v.translation.language}/${v.book.slug}/${v.chapterNumber}#V${v.verseNumber}`;
      importBatch.push({
        id: v.id,
        translationId: v.translationId,
        language: v.translation.language,
        testament: v.book.testament,
        bookId: v.bookId,
        bookSlug: v.book.slug,
        bookName: v.book.nameEs,
        chapterNumber: v.chapterNumber,
        verseNumber: v.verseNumber,
        text: v.text,
        normalizedText: v.normalizedText,
        reference,
        url,
      });
      if (importBatch.length >= 300) await pushBatch();
    }

    skip += take;
  }

  await pushBatch();
  const dbCount = await prisma.verse.count();
  console.log(
    JSON.stringify(
      { collection: VERSES_COLLECTION, versesInDb: dbCount, documentsImported: imported },
      null,
      2,
    ),
  );
  if (imported !== dbCount) {
    console.warn("Warning: imported document count differs from Verse row count.");
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
