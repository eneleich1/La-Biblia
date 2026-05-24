/**
 * Añade Eclesiástico 25 y 27 desde archivos .txt al import JSON y bible-static.
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";

const CHAPTER_FILES = [
  {
    chapter: 25,
    path: path.join(
      process.env.USERPROFILE ?? "",
      "Desktop",
      "La Biblia Project",
      "eclesiastico 25.txt",
    ),
  },
  {
    chapter: 27,
    path: path.join(
      process.env.USERPROFILE ?? "",
      "Desktop",
      "La Biblia Project",
      "eclesiatico 27.txt",
    ),
  },
];

function parseChapterTxt(raw, chapterNumber) {
  const verses = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || /^Eclesiástico/i.test(trimmed)) continue;
    const match = trimmed.match(/^(\d+)\.\s*(.*)$/);
    if (!match) continue;
    const verseNumber = parseInt(match[1], 10);
    const text = match[2].trim();
    if (!text) continue;
    verses.push({ verseNumber, text });
  }

  return {
    number: chapterNumber,
    title: `Eclesiástico ${chapterNumber}`,
    shortTitle: `short title: Eclesiástico ${chapterNumber}`,
    verses,
  };
}

function toImportChapter(chapter) {
  return {
    Title: chapter.title,
    ShortTitle: chapter.shortTitle,
    Versicles: chapter.verses.map((v) => ({
      Index: v.verseNumber,
      Text: ` ${v.text} `,
      VersicleNumber: v.verseNumber,
    })),
  };
}

function insertByTitle(chapters, entry, title) {
  const next = chapters.filter((c) => c.Title !== title);
  const num = parseInt(title.match(/(\d+)\s*$/)[1], 10);
  const idx = next.findIndex((c) => parseInt(c.Title.match(/(\d+)\s*$/)[1], 10) > num);
  if (idx === -1) next.push(entry);
  else next.splice(idx, 0, entry);
  return next;
}

async function main() {
  const roots = [
    path.join(process.cwd(), "data", "bible-static", "es"),
    path.join(process.cwd(), "public", "bible-static", "es"),
  ];
  const importPath = path.join(process.cwd(), "data", "import", "antiguo-testamento.json");

  const chapters = [];
  for (const spec of CHAPTER_FILES) {
    const raw = await readFile(spec.path, "utf-8");
    chapters.push(parseChapterTxt(raw, spec.chapter));
  }

  const importJson = JSON.parse(await readFile(importPath, "utf-8"));
  const book = importJson.Books.find((b) => /28- ECLESI/i.test(b.Title));
  if (!book) throw new Error("Libro ECLESIÁSTICO no encontrado en import JSON");

  for (const chapter of chapters) {
    book.Chapters = insertByTitle(book.Chapters, toImportChapter(chapter), chapter.title);
  }
  await writeFile(importPath, `${JSON.stringify(importJson)}\n`, "utf-8");

  for (const root of roots) {
    const bookPath = path.join(root, "books", "eclesiastico.json");
    const manifestPath = path.join(root, "manifest.json");
    const bookJson = JSON.parse(await readFile(bookPath, "utf-8"));
    const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));

    for (const chapter of chapters) {
      bookJson.chapters = bookJson.chapters.filter((c) => c.number !== chapter.number);
      const idx = bookJson.chapters.findIndex((c) => c.number > chapter.number);
      if (idx === -1) bookJson.chapters.push(chapter);
      else bookJson.chapters.splice(idx, 0, chapter);
    }
    bookJson.chapters.sort((a, b) => a.number - b.number);

    const manifestBook = manifest.books.find((b) => b.slug === "eclesiastico");
    manifestBook.chapters = bookJson.chapters.map((c) => ({ number: c.number }));

    await writeFile(bookPath, `${JSON.stringify(bookJson)}\n`, "utf-8");
    await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`, "utf-8");
  }

  console.log(
    JSON.stringify(
      {
        added: chapters.map((c) => ({ number: c.number, verses: c.verses.length })),
        totalChapters: book.Chapters.length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
