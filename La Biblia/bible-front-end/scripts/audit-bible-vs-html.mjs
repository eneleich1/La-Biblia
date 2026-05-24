/**
 * Audita bible-static + audio vs HTML fuente en La Biblia/
 * Solo informe; no modifica datos.
 */
import { readdir, readFile } from "fs/promises";
import path from "path";

const BIBLIA_ROOT = path.resolve(
  process.cwd(),
  "..",
);
const BIBLE_STATIC = path.join(process.cwd(), "data", "bible-static", "es");
const AUDIO_MANIFEST = path.join(process.cwd(), "data", "audio-static", "es", "manifest.json");
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

async function scanHtmlBooks(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const books = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (ent.name.startsWith("00-")) continue;
    const bookDir = path.join(rootDir, ent.name);
    const files = await readdir(bookDir);
    const chapters = [];
    for (const f of files) {
      if (!f.toLowerCase().endsWith(".html")) continue;
      const n = parseChapterFromFilename(f);
      if (n != null) chapters.push({ file: f, number: n });
    }
    chapters.sort((a, b) => a.number - b.number);
    const folderKey = normalizeBookKey(ent.name);
    books.push({
      folder: ent.name,
      folderKey,
      chapters,
      chapterNumbers: chapters.map((c) => c.number),
    });
  }
  return books;
}

function stripTitlePrefix(title) {
  return title.replace(/^\d+-\s*/, "").trim();
}

function normalizeKey(s) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const [manifestRaw, audioRaw, otBooks, ntBooks] = await Promise.all([
    readFile(path.join(BIBLE_STATIC, "manifest.json"), "utf-8"),
    readFile(AUDIO_MANIFEST, "utf-8").catch(() => '{"links":{}}'),
    scanHtmlBooks(OT_HTML),
    scanHtmlBooks(NT_HTML),
  ]);

  const manifest = JSON.parse(manifestRaw);
  const audio = JSON.parse(audioRaw);

  const staticBySlug = new Map();
  for (const book of manifest.books) {
    const bookJson = JSON.parse(
      await readFile(path.join(BIBLE_STATIC, "books", `${book.slug}.json`), "utf-8"),
    );
    staticBySlug.set(book.slug, {
      nameEs: book.nameEs,
      manifestChapters: book.chapters.map((c) => c.number).sort((a, b) => a - b),
      jsonChapters: bookJson.chapters.map((c) => c.number).sort((a, b) => a - b),
      jsonTitles: bookJson.chapters.map((c) => ({ n: c.number, t: c.title })),
    });
  }

  const htmlByKey = new Map();
  for (const b of [...otBooks, ...ntBooks]) {
    htmlByKey.set(b.folderKey, b);
  }

  const slugByKey = new Map();
  for (const book of manifest.books) {
    slugByKey.set(normalizeKey(book.nameEs), book.slug);
    slugByKey.set(normalizeKey(stripTitlePrefix(book.nameEs)), book.slug);
  }

  const issues = [];
  let matchedBooks = 0;

  for (const [key, html] of htmlByKey) {
    const slug = slugByKey.get(key);
    if (!slug) {
      issues.push({ type: "html_book_unmapped", folder: html.folder, folderKey: key });
      continue;
    }
    matchedBooks++;
    const st = staticBySlug.get(slug);
    const htmlNums = [...new Set(html.chapterNumbers)].sort((a, b) => a - b);
    const staticNums = st.manifestChapters;
    const jsonNums = st.jsonChapters;

    const inHtmlNotStatic = htmlNums.filter((n) => !staticNums.includes(n));
    const inStaticNotHtml = staticNums.filter((n) => !htmlNums.includes(n));
    const manifestVsJson =
      staticNums.join(",") !== jsonNums.join(",")
        ? { manifest: staticNums, json: jsonNums }
        : null;

    const audioLinks = audio.links?.[slug] ?? {};
    const audioNums = Object.keys(audioLinks)
      .filter((k) => audioLinks[k]?.youtubeVideoId)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b);
    const inHtmlNoAudio = htmlNums.filter((n) => !audioNums.includes(n));
    const inAudioNotHtml = audioNums.filter((n) => !htmlNums.includes(n));

    if (
      inHtmlNotStatic.length ||
      inStaticNotHtml.length ||
      manifestVsJson ||
      inHtmlNoAudio.length ||
      inAudioNotHtml.length
    ) {
      issues.push({
        slug,
        nameEs: st.nameEs,
        htmlFolder: html.folder,
        htmlCount: htmlNums.length,
        staticCount: staticNums.length,
        inHtmlNotStatic,
        inStaticNotHtml,
        manifestVsJson,
        inHtmlNoAudio: inHtmlNoAudio.length ? inHtmlNoAudio : undefined,
        inAudioNotHtml: inAudioNotHtml.length ? inAudioNotHtml : undefined,
        htmlRange: htmlNums.length ? [htmlNums[0], htmlNums[htmlNums.length - 1]] : [],
        staticRange: staticNums.length ? [staticNums[0], staticNums[staticNums.length - 1]] : [],
      });
    }
  }

  const staticSlugs = new Set(manifest.books.map((b) => b.slug));
  const mappedSlugs = new Set(
    [...htmlByKey.keys()].map((k) => slugByKey.get(k)).filter(Boolean),
  );
  const staticNoHtml = [...staticSlugs].filter((s) => !mappedSlugs.has(s));

  let totalHtmlChapters = 0;
  let totalStaticChapters = 0;
  for (const b of htmlByKey.values()) totalHtmlChapters += b.chapterNumbers.length;
  for (const st of staticBySlug.values()) totalStaticChapters += st.manifestChapters.length;

  const summary = {
    htmlBooks: htmlByKey.size,
    staticBooks: manifest.books.length,
    matchedBooks,
    totalHtmlChapterFiles: totalHtmlChapters,
    totalStaticChapters,
    issuesCount: issues.length,
    htmlUnmapped: issues.filter((i) => i.type === "html_book_unmapped").length,
    staticBooksWithoutHtmlFolder: staticNoHtml.length,
  };

  console.log(JSON.stringify({ summary, staticNoHtml, issues }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
