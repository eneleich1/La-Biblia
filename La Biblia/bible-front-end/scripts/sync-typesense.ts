import { PrismaClient } from "@prisma/client";
import { getTypesenseClient, VERSES_COLLECTION } from "../lib/typesense";

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
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    await client.collections(VERSES_COLLECTION).delete();
  } catch {
    // collection may not exist
  }

  await client.collections().create(schema);

  const take = 300;
  let cursor: string | undefined;
  const importBatch: Record<string, unknown>[] = [];

  const pushBatch = async () => {
    if (!importBatch.length) return;
    await client
      .collections(VERSES_COLLECTION)
      .documents()
      .import(importBatch, { action: "create" });
    importBatch.length = 0;
  };

  for (;;) {
    const verses = await prisma.verse.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: "asc" },
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
      if (importBatch.length >= 200) await pushBatch();
    }

    cursor = verses[verses.length - 1].id;
    if (verses.length < take) break;
  }

  await pushBatch();
  console.log("Typesense sync complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
