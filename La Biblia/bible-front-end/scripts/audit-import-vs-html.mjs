/**
 * Compara data/import/*.json vs HTML fuente (capítulos por número en título).
 */
import { readdir, readFile } from "fs/promises";
import path from "path";

const BIBLIA_ROOT = path.resolve(process.cwd(), "..");
const OT_HTML = path.join(BIBLIA_ROOT, "00 - Antiguo Testamento");
const NT_HTML = path.join(BIBLIA_ROOT, "01 - Nuevo Testamento");

function parseChapterFromFilename(name) {
  const m = name.match(/(\d+)\s*\.html$/i);
  return m ? parseInt(m[1], 10) : null;
}

function normalizeBookKey(name) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/^\d+-\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTitlePrefix(title) {
  return title.replace(/^\d+-\s*/, "").trim();
}

function chapterNumsFromImport(book) {
  return book.Chapters.map((ch) => {
    const m = ch.Title.match(/(\d+)\s*$/);
    if (!m) throw new Error(ch.Title);
    return parseInt(m[1], 10);
  });
}

async function scanHtmlBooks(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const books = [];
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith("00-")) continue;
    const files = await readdir(path.join(rootDir, ent.name));
    const chapterNumbers = files
      .map(parseChapterFromFilename)
      .filter((n) => n != null)
      .sort((a, b) => a - b);
    books.push({ folder: ent.name, folderKey: normalizeBookKey(ent.name), chapterNumbers });
  }
  return books;
}

async function main() {
  const [oldT, newT, otHtml, ntHtml] = await Promise.all([
    readFile(path.join(process.cwd(), "data", "import", "antiguo-testamento.json"), "utf-8").then(JSON.parse),
    readFile(path.join(process.cwd(), "data", "import", "nuevo-testamento.json"), "utf-8").then(JSON.parse),
    scanHtmlBooks(OT_HTML),
    scanHtmlBooks(NT_HTML),
  ]);

  const htmlByKey = new Map([...otHtml, ...ntHtml].map((b) => [b.folderKey, b]));
  const issues = [];

  for (const root of [oldT, newT]) {
    for (const book of root.Books) {
      const key = normalizeBookKey(book.Title);
      const html = htmlByKey.get(key);
      if (!html) {
        issues.push({ book: book.Title, type: "no_html_folder" });
        continue;
      }
      const imp = chapterNumsFromImport(book);
      const htmlNums = [...new Set(html.chapterNumbers)].sort((a, b) => a - b);
      const inHtmlNotImp = htmlNums.filter((n) => !imp.includes(n));
      const inImpNotHtml = imp.filter((n) => !htmlNums.includes(n));
      if (inHtmlNotImp.length || inImpNotHtml.length || imp.length !== htmlNums.length) {
        issues.push({
          book: stripTitlePrefix(book.Title),
          htmlCount: htmlNums.length,
          importCount: imp.length,
          inHtmlNotImp,
          inImpNotHtml,
          htmlLast: htmlNums.slice(-3),
          importLast: imp.slice(-3),
        });
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        htmlBooks: htmlByKey.size,
        importBooks: oldT.Books.length + newT.Books.length,
        issuesCount: issues.length,
        issues,
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
