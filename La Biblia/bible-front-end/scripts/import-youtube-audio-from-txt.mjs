/**
 * Importa enlaces de YouTube desde mis_videos_youtube.txt al manifest de audio.
 *
 * Uso:
 *   node scripts/import-youtube-audio-from-txt.mjs [ruta-al-txt]
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DEFAULT_TXT = path.join(
  process.env.USERPROFILE ?? "",
  "Desktop",
  "La Biblia Project",
  "Scripts",
  "mis_videos_youtube.txt",
);

const BIBLE_MANIFEST = path.join(process.cwd(), "data", "bible-static", "es", "manifest.json");
const AUDIO_MANIFEST = path.join(process.cwd(), "data", "audio-static", "es", "manifest.json");
const REPORT_PATH = path.join(
  process.cwd(),
  "data",
  "audio-static",
  "es",
  "youtube-import-report.json",
);

/** slug → alias normalizados (sin acentos, minúsculas) */
const BOOK_ALIASES = {
  genesis: ["genesis"],
  exodo: ["exodo"],
  levitico: ["levitico"],
  numeros: ["numeros"],
  deuteronomio: ["deuteronomio"],
  josue: ["josue"],
  jueces: ["jueces"],
  rut: ["rut"],
  "libro-primero-de-samuel": ["1 samuel"],
  "libro-segundo-de-samuel": ["2 samuel"],
  "libro-primero-de-los-reyes": ["1 reyes"],
  "libro-segundo-de-los-reyes": ["2 reyes"],
  "libro-primero-de-las-cronicas": ["1 cronicas"],
  "libro-segundo-de-las-cronicas": ["2 cronicas"],
  esdras: ["esdras"],
  nehemias: ["nehemias"],
  tobias: ["tobias"],
  judit: ["judit"],
  ester: ["ester", "i ester"],
  "i-macabeos": ["i macabeos", "1 macabeos"],
  "ii-macabeos": ["ii macabeos", "2 macabeos"],
  job: ["job"],
  "los-salmos": ["salmo", "salmos"],
  proverbios: ["proverbios"],
  eclesiastes: ["eclesiastes"],
  "cantar-de-los-cantares": ["cantar de los cantares"],
  sabiduria: ["sabiduria"],
  eclesiastico: ["eclesiastico"],
  isaias: ["isaias"],
  jeremias: ["jeremias"],
  lamentaciones: ["lamentaciones"],
  baruc: ["baruc"],
  ezequiel: ["ezequiel"],
  daniel: ["daniel"],
  oseas: ["oseas"],
  joel: ["joel"],
  amos: ["amos"],
  abdias: ["abdias"],
  jonas: ["jonas"],
  miqueas: ["miqueas"],
  nahum: ["nahum"],
  habacuc: ["habacuc"],
  sofonias: ["sofonias"],
  ageo: ["ageo"],
  zacarias: ["zacarias"],
  malaquias: ["malaquias"],
  "evangelio-segun-san-mateo": ["mateo"],
  "evangelio-segun-san-marcos": ["marcos"],
  "evangelio-segun-san-lucas": ["lucas"],
  "evangelio-segun-san-juan": ["juan"],
  "hechos-de-los-apostoles": ["hechos"],
  "epistola-a-los-romanos": ["romanos"],
  "primera-epistola-a-los-corintios": ["1 corintios"],
  "segunda-epistola-a-los-corintios": ["2 corintios"],
  "epistola-a-los-galatas": ["galatas"],
  "epistola-a-los-efesios": ["efesios"],
  "epistola-a-los-filipenses": ["filipenses"],
  "epistola-a-los-colosenses": ["colosenses"],
  "primera-epistola-a-los-tesalonicenses": ["1 tesalonicenses"],
  "segunda-epistola-a-los-tesalonicenses": ["2 tesalonicenses"],
  "primera-epistola-a-timoteo": ["1 timoteo"],
  "segunda-epistola-a-timoteo": ["2 timoteo"],
  "epistola-a-tito": ["tito"],
  "epistola-a-filemon": ["filemon"],
  "epistola-a-los-hebreos": ["hebreos"],
  "epistola-de-santiago": ["santiago"],
  "primera-epistola-de-san-pedro": ["1 pedro"],
  "segunda-epistola-de-san-pedro": ["2 pedro"],
  "primera-epistola-de-san-juan": ["1 juan"],
  "segunda-epistola-de-san-juan": ["2 juan"],
  "tercera-epistola-de-san-juan": ["3 juan"],
  "epistola-de-san-judas": ["judas"],
  apocalipsis: ["apocalipsis"],
};

function normalizeKey(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAliasToSlug() {
  const map = new Map();
  for (const [slug, aliases] of Object.entries(BOOK_ALIASES)) {
    for (const alias of aliases) {
      map.set(normalizeKey(alias), slug);
    }
  }
  return map;
}

function extractVideoId(url) {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1).split("/")[0];
    return parsed.searchParams.get("v");
  } catch {
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m?.[1] ?? null;
  }
}

function parseBibleVideoTitle(title) {
  let normalized = title.replace(/\s+/g, " ").trim();
  if (!/la biblia de jerusalen/i.test(normalized)) return null;

  // "Cantar de los Cantares txt 5" → capítulo 5
  normalized = normalized.replace(/\s+txt\s+/gi, " ");

  const m =
    normalized.match(/Audio Esp?\s*\.?\s*(.+?)\s+(\d+)\s*$/i) ??
    normalized.match(/1976\s+Audio Esp\s+(.+?)\s+(\d+)\s*$/i);
  if (!m) return null;

  const bookName = m[1].trim().replace(/\.$/, "");
  const chapter = parseInt(m[2], 10);
  if (!Number.isFinite(chapter) || chapter < 1) return null;

  return { bookName, chapter };
}

function parseTxtFile(text) {
  const blocks = text.split(/-{40}/).map((b) => b.trim()).filter(Boolean);
  const rows = [];
  for (const block of blocks) {
    const titleMatch = block.match(/T[ií]tulo:\s*(.+)/i);
    const urlMatch = block.match(/Enlace:\s*(.+)/i);
    if (!titleMatch || !urlMatch) continue;
    const title = titleMatch[1].trim();
    const url = urlMatch[1].trim();
    const videoId = extractVideoId(url);
    if (!videoId) continue;
    rows.push({ title, url, videoId });
  }
  return rows;
}

async function main() {
  const txtPath = process.argv[2] ?? DEFAULT_TXT;
  const aliasToSlug = buildAliasToSlug();

  const [txtRaw, bibleRaw] = await Promise.all([
    readFile(txtPath, "utf-8"),
    readFile(BIBLE_MANIFEST, "utf-8"),
  ]);

  const bible = JSON.parse(bibleRaw);
  const bookBySlug = new Map(bible.books.map((b) => [b.slug, b]));
  const maxChapterBySlug = new Map(
    bible.books.map((b) => [
      b.slug,
      Math.max(...b.chapters.map((c) => c.number)),
    ]),
  );
  const validChaptersBySlug = new Map(
    bible.books.map((b) => [b.slug, new Set(b.chapters.map((c) => c.number))]),
  );

  let audioManifest = { links: {} };
  try {
    audioManifest = JSON.parse(await readFile(AUDIO_MANIFEST, "utf-8"));
  } catch {
    /* nuevo */
  }
  if (!audioManifest.links) audioManifest.links = {};

  const rows = parseTxtFile(txtRaw);
  const stats = {
    totalRows: rows.length,
    bibleRows: 0,
    imported: 0,
    updated: 0,
    skippedNonBible: 0,
    unmatched: [],
    invalidChapter: [],
    conflicts: [],
  };

  for (const row of rows) {
    const parsed = parseBibleVideoTitle(row.title);
    if (!parsed) {
      if (/la biblia de jerusalen/i.test(row.title)) {
        stats.unmatched.push({ ...row, reason: "titulo_no_parseable" });
      } else {
        stats.skippedNonBible++;
      }
      continue;
    }

    stats.bibleRows++;
    const slug = aliasToSlug.get(normalizeKey(parsed.bookName));
    if (!slug) {
      stats.unmatched.push({ ...row, bookName: parsed.bookName, chapter: parsed.chapter, reason: "libro_desconocido" });
      continue;
    }

    const validChapters = validChaptersBySlug.get(slug);
    const maxChapter = maxChapterBySlug.get(slug);
    if (!validChapters?.has(parsed.chapter)) {
      stats.invalidChapter.push({
        ...row,
        slug,
        bookName: parsed.bookName,
        chapter: parsed.chapter,
        maxChapter,
      });
      continue;
    }

    if (!audioManifest.links[slug]) audioManifest.links[slug] = {};
    const key = String(parsed.chapter);
    const prev = audioManifest.links[slug][key];
    if (prev && prev.youtubeVideoId !== row.videoId) {
      stats.conflicts.push({
        slug,
        chapter: parsed.chapter,
        previousId: prev.youtubeVideoId,
        newId: row.videoId,
        title: row.title,
      });
    }
    if (prev?.youtubeVideoId === row.videoId) {
      continue;
    }
    audioManifest.links[slug][key] = {
      youtubeVideoId: row.videoId,
      startSecond: null,
      endSecond: null,
    };
    if (prev) stats.updated++;
    else stats.imported++;
  }

  const missingChapters = [];
  for (const book of bible.books) {
    const links = audioManifest.links[book.slug] ?? {};
    const missing = [];
    for (const { number: c } of book.chapters) {
      if (!links[String(c)]?.youtubeVideoId) missing.push(c);
    }
    if (missing.length) {
      missingChapters.push({
        slug: book.slug,
        nameEs: book.nameEs,
        missing,
        missingCount: missing.length,
        total: book.chapters.length,
      });
    }
  }

  await mkdir(path.dirname(AUDIO_MANIFEST), { recursive: true });
  await writeFile(AUDIO_MANIFEST, `${JSON.stringify(audioManifest, null, 2)}\n`, "utf-8");

  const report = {
    generatedAt: new Date().toISOString(),
    source: txtPath,
    stats: {
      ...stats,
      unmatchedCount: stats.unmatched.length,
      invalidChapterCount: stats.invalidChapter.length,
      conflictCount: stats.conflicts.length,
      missingBooksCount: missingChapters.length,
      missingChaptersTotal: missingChapters.reduce((n, b) => n + b.missingCount, 0),
    },
    missingChapters,
    unmatched: stats.unmatched,
    invalidChapter: stats.invalidChapter,
    conflicts: stats.conflicts,
  };

  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

  process.stdout.write(`Fuente: ${txtPath}\n`);
  process.stdout.write(`Vídeos en TXT: ${stats.totalRows}\n`);
  process.stdout.write(`Vídeos de Biblia: ${stats.bibleRows}\n`);
  process.stdout.write(`Nuevos enlaces: ${stats.imported}\n`);
  process.stdout.write(`Actualizados: ${stats.updated}\n`);
  process.stdout.write(`No emparejados: ${stats.unmatched.length}\n`);
  process.stdout.write(`Capítulo inválido: ${stats.invalidChapter.length}\n`);
  process.stdout.write(`Capítulos aún sin vídeo: ${report.stats.missingChaptersTotal}\n`);
  process.stdout.write(`Manifest: ${AUDIO_MANIFEST}\n`);
  process.stdout.write(`Informe: ${REPORT_PATH}\n`);

  if (stats.unmatched.length) {
    process.stdout.write("\n--- No emparejados ---\n");
    for (const row of stats.unmatched.slice(0, 30)) {
      process.stdout.write(`  ${row.title}${row.reason ? ` (${row.reason})` : ""}\n`);
    }
    if (stats.unmatched.length > 30) process.stdout.write(`  ... y ${stats.unmatched.length - 30} más\n`);
  }

  if (missingChapters.length) {
    process.stdout.write("\n--- Libros con capítulos faltantes ---\n");
    for (const book of missingChapters.slice(0, 20)) {
      process.stdout.write(
        `  ${book.nameEs}: ${book.missingCount}/${book.total} (ej. cap. ${book.missing.slice(0, 8).join(", ")}${book.missing.length > 8 ? "…" : ""})\n`,
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
