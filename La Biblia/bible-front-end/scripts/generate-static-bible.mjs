import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

function normalizeText(input) {
  const base = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  return base
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(raw, used) {
  const slug =
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

function stripTitlePrefix(title) {
  return title.replace(/^\d+-\s*/, "").trim();
}

/** Número de capítulo según el título (p. ej. "Eclesiástico 50", "Salmo 100"), no la posición en el array. */
function parseChapterNumber(title) {
  const match = title.match(/(\d+)\s*$/);
  if (!match) throw new Error(`No se pudo obtener el número de capítulo de: ${title}`);
  return parseInt(match[1], 10);
}

async function loadJson(relPath) {
  const text = await readFile(path.join(process.cwd(), "data", "import", relPath), "utf-8");
  return JSON.parse(text);
}

async function main() {
  const [oldTestament, newTestament, bookConfigs] = await Promise.all([
    loadJson("antiguo-testamento.json"),
    loadJson("nuevo-testamento.json"),
    loadJson("bookConfigs.json"),
  ]);

  const outputRoots = [
    path.join(process.cwd(), "data", "bible-static", "es"),
    path.join(process.cwd(), "public", "bible-static", "es"),
  ];
  for (const outputRoot of outputRoots) {
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(path.join(outputRoot, "books"), { recursive: true });
  }

  const detailGroups = bookConfigs[1]?.BooksGroups ?? [];
  const categoryMap = new Map();
  for (const group of detailGroups) {
    for (const index of group.BookIndexes) {
      categoryMap.set(`${group.Testament}:${index}`, group.Title);
    }
  }

  const usedSlugs = new Set();
  const manifest = {
    translations: [
      {
        name: "La Biblia de Jerusalen",
        language: "es",
        abbreviation: "BJ1976",
        edition: "Edicion de 1976",
      },
    ],
    books: [],
  };

  async function writeTestament(root, testament) {
    let order = 0;
    for (const book of root.Books) {
      order += 1;
      const nameEs = stripTitlePrefix(book.Title);
      const slug = slugify(nameEs, usedSlugs);
      const chapters = book.Chapters.map((chapter) => ({
        number: parseChapterNumber(chapter.Title),
        title: chapter.Title,
        shortTitle: chapter.ShortTitle,
        verses: chapter.Versicles
          .map((verse) => ({
            verseNumber: verse.VersicleNumber ?? verse.Index,
            text: String(verse.Text ?? "").trim(),
          }))
          .filter((verse) => verse.text),
      }));

      manifest.books.push({
        testament,
        order,
        slug,
        nameEs,
        nameEn: null,
        category: categoryMap.get(`${testament}:${order}`) ?? null,
        chapters: chapters.map((chapter) => ({ number: chapter.number })),
      });

      await Promise.all(
        outputRoots.map((outputRoot) =>
          writeFile(
            path.join(outputRoot, "books", `${slug}.json`),
            `${JSON.stringify({ testament, order, slug, nameEs, chapters })}\n`,
            "utf-8",
          ),
        ),
      );
    }
  }

  await writeTestament(oldTestament, 1);
  await writeTestament(newTestament, 2);

  await Promise.all(
    outputRoots.map((outputRoot) =>
      writeFile(
        path.join(outputRoot, "manifest.json"),
        `${JSON.stringify(manifest)}\n`,
        "utf-8",
      ),
    ),
  );

  console.log(
    JSON.stringify(
      {
        outputRoots,
        books: manifest.books.length,
        chapters: manifest.books.reduce((sum, book) => sum + book.chapters.length, 0),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
