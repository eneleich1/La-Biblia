/**
 * Busca vídeos en YouTube (HTML, sin API) y rellena data/audio-static/es/manifest.json
 *
 * Plantillas:
 * - pentateuch: La Biblia de Jerusalen, 1976  Audio Esp {libro} {cap}
 * - audio-es:   La Biblia de Jerusalen Audio Es {libro} {cap}  (Hechos → Apocalipsis)
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const LANGUAGE = "es";
const MANIFEST_PATH = path.join(process.cwd(), "data", "bible-static", "es", "manifest.json");
const AUDIO_MANIFEST_PATH = path.join(process.cwd(), "data", "audio-static", "es", "manifest.json");
const REPORT_PATH = path.join(
  process.cwd(),
  "data",
  "audio-static",
  "es",
  "youtube-not-found-report.json",
);

/** @type {Record<string, { template: "pentateuch" | "audio-es", youtubeName: string, skip?: boolean }>} */
const BOOK_YOUTUBE = {
  genesis: { template: "pentateuch", youtubeName: "Genesis" },
  exodo: { template: "pentateuch", youtubeName: "Exodo" },
  levitico: { template: "pentateuch", youtubeName: "Levitico" },
  numeros: { template: "pentateuch", youtubeName: "Numeros" },
  deuteronomio: { template: "pentateuch", youtubeName: "Deuteronomio" },
  josue: { template: "audio-es", youtubeName: "Josue" },
  jueces: { template: "audio-es", youtubeName: "Jueces" },
  rut: { template: "audio-es", youtubeName: "Rut" },
  "libro-primero-de-samuel": { template: "audio-es", youtubeName: "1 Samuel" },
  "libro-primero-de-los-reyes": { template: "audio-es", youtubeName: "1 Reyes" },
  "libro-segundo-de-los-reyes": { template: "audio-es", youtubeName: "2 Reyes" },
  "libro-primero-de-las-cronicas": { template: "audio-es", youtubeName: "1 Cronicas" },
  "libro-segundo-de-las-cronicas": { template: "audio-es", youtubeName: "2 Cronicas" },
  "hechos-de-los-apostoles": { template: "audio-es", youtubeName: "Hechos", skip: true },
  "epistola-a-los-romanos": { template: "audio-es", youtubeName: "Romanos" },
  "primera-epistola-a-los-corintios": { template: "audio-es", youtubeName: "1 Corintios" },
  "segunda-epistola-a-los-corintios": { template: "audio-es", youtubeName: "2 Corintios" },
  "epistola-a-los-galatas": { template: "audio-es", youtubeName: "Galatas" },
  "epistola-a-los-efesios": { template: "audio-es", youtubeName: "Efesios" },
  "epistola-a-los-filipenses": { template: "audio-es", youtubeName: "Filipenses" },
  "epistola-a-los-colosenses": { template: "audio-es", youtubeName: "Colosenses" },
  "primera-epistola-a-los-tesalonicenses": { template: "audio-es", youtubeName: "1 Tesalonicenses" },
  "segunda-epistola-a-los-tesalonicenses": { template: "audio-es", youtubeName: "2 Tesalonicenses" },
  "primera-epistola-a-timoteo": { template: "audio-es", youtubeName: "1 Timoteo" },
  "segunda-epistola-a-timoteo": { template: "audio-es", youtubeName: "2 Timoteo" },
  "epistola-a-tito": { template: "audio-es", youtubeName: "Tito" },
  "epistola-a-filemon": { template: "audio-es", youtubeName: "Filemon" },
  "epistola-a-los-hebreos": { template: "audio-es", youtubeName: "Hebreos" },
  "epistola-de-santiago": { template: "audio-es", youtubeName: "Santiago" },
  "primera-epistola-de-san-pedro": { template: "audio-es", youtubeName: "1 Pedro" },
  "segunda-epistola-de-san-pedro": { template: "audio-es", youtubeName: "2 Pedro" },
  "primera-epistola-de-san-juan": { template: "audio-es", youtubeName: "1 Juan" },
  "segunda-epistola-de-san-juan": { template: "audio-es", youtubeName: "2 Juan" },
  "tercera-epistola-de-san-juan": { template: "audio-es", youtubeName: "3 Juan" },
  "epistola-de-san-judas": { template: "audio-es", youtubeName: "Judas" },
  apocalipsis: { template: "audio-es", youtubeName: "Apocalipsis" },
};

function normalizeTitle(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExpectedTitle(config, chapter) {
  if (config.template === "pentateuch") {
    return `La Biblia de Jerusalen, 1976  Audio Esp ${config.youtubeName} ${chapter}`;
  }
  return `La Biblia de Jerusalen Audio Es ${config.youtubeName} ${chapter}`;
}

function scoreMatch(resultTitle, config, chapter) {
  const norm = normalizeTitle(resultTitle);
  const expected = normalizeTitle(buildExpectedTitle(config, chapter));
  const bookNorm = normalizeTitle(config.youtubeName);

  if (norm === expected) return 100;
  if (norm.includes(expected)) return 95;

  const compactExpected = expected.replace(/\s+/g, "");
  const compactNorm = norm.replace(/\s+/g, "");
  if (compactNorm.includes(compactExpected)) return 92;

  const hasJerusalen = norm.includes("jerusalen");
  const hasAudio =
    config.template === "pentateuch"
      ? norm.includes("audio") && norm.includes("esp")
      : norm.includes("audio") && (norm.includes("audio es") || norm.includes("audioes"));

  if (!hasJerusalen || !hasAudio) return 0;

  if (!norm.includes(bookNorm)) return 0;

  const chapterRe = new RegExp(`\\b${bookNorm}\\s+${chapter}\\b|\\b${chapter}\\b`);
  if (chapterRe.test(norm)) return 85;

  const tailMatch = norm.match(new RegExp(`${bookNorm}\\s+(\\d+)`));
  if (tailMatch && Number(tailMatch[1]) === chapter) return 80;

  if (norm.includes(bookNorm) && new RegExp(`\\b${chapter}\\b`).test(norm)) return 70;

  return 0;
}

async function searchYouTube(query, attempt = 1) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const titleRegex = /"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"\}/g;
    const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;

    const titles = [];
    for (const match of html.matchAll(titleRegex)) {
      titles.push(
        match[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
      );
    }
    const ids = [...html.matchAll(idRegex)].map((m) => m[1]);

    const results = [];
    const seen = new Set();
    for (let i = 0; i < Math.min(titles.length, ids.length); i++) {
      if (seen.has(ids[i])) continue;
      seen.add(ids[i]);
      results.push({ videoId: ids[i], title: titles[i] });
    }
    return results;
  } catch (error) {
    if (attempt < 4) {
      await sleep(2500 * attempt);
      return searchYouTube(query, attempt + 1);
    }
    throw error;
  }
}

function pickBest(results, config, chapter) {
  let best = null;
  let bestScore = 0;
  for (const result of results) {
    const score = scoreMatch(result.title, config, chapter);
    if (score > bestScore) {
      bestScore = score;
      best = result;
    }
  }
  return bestScore >= 70 ? best : null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadBibleBooks() {
  const raw = await readFile(MANIFEST_PATH, "utf-8");
  const manifest = JSON.parse(raw);
  return manifest.books;
}

async function loadAudioManifest() {
  try {
    const raw = await readFile(AUDIO_MANIFEST_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { links: {} };
  }
}

function booksToProcess(allBooks, onlySlug, onlyBooks) {
  const actsIndex = allBooks.findIndex((b) => b.slug === "hechos-de-los-apostoles");
  const allowed = new Set([
    "genesis",
    "exodo",
    "levitico",
    "numeros",
    "deuteronomio",
    "josue",
    "jueces",
    "rut",
    "libro-primero-de-samuel",
    "libro-primero-de-los-reyes",
    "libro-segundo-de-los-reyes",
    "libro-primero-de-las-cronicas",
    "libro-segundo-de-las-cronicas",
    ...allBooks.slice(actsIndex).map((b) => b.slug),
  ]);

  let list = allBooks.filter((b) => allowed.has(b.slug) && BOOK_YOUTUBE[b.slug]);
  if (onlyBooks?.length) {
    const pick = new Set(onlyBooks);
    list = list.filter((b) => pick.has(b.slug));
  }
  if (onlySlug) list = list.filter((b) => b.slug === onlySlug);
  return list;
}

async function resolveChapter(book, config, chapter, existingLink) {
  if (existingLink?.youtubeVideoId) {
    return { chapter, status: "skipped_existing", videoId: existingLink.youtubeVideoId };
  }

  const query = buildExpectedTitle(config, chapter);
  const results = await searchYouTube(query);
  const match = pickBest(results, config, chapter);
  if (match) {
    return {
      chapter,
      status: "ok",
      query,
      videoId: match.videoId,
      title: match.title,
    };
  }
  return {
    chapter,
    status: "not_found",
    query,
    candidates: results.slice(0, 5).map((r) => r.title),
  };
}

async function main() {
  const onlyMissing = process.argv.includes("--missing");
  const onlySlugArg = process.argv.find((a) => a.startsWith("--book="));
  const onlySlug = onlySlugArg?.split("=")[1] ?? null;
  const onlyBooksArg = process.argv.find((a) => a.startsWith("--books="));
  const onlyBooks = onlyBooksArg?.split("=")[1]?.split(",").filter(Boolean) ?? null;

  const allBooks = await loadBibleBooks();
  const books = booksToProcess(allBooks, onlySlug, onlyBooks);
  const audioManifest = await loadAudioManifest();
  if (!audioManifest.links) audioManifest.links = {};

  const notFoundReport = [];
  let totalOk = 0;
  let totalMissing = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const book of books) {
    const config = BOOK_YOUTUBE[book.slug];
    if (config.skip) {
      process.stdout.write(`\n=== ${book.nameEs} (${book.slug}) — omitido (ya enlazado) ===\n`);
      continue;
    }

    if (!audioManifest.links[book.slug]) audioManifest.links[book.slug] = {};
    const bookLinks = audioManifest.links[book.slug];
    const chapterCount = book.chapters.length;

    process.stdout.write(
      `\n=== ${book.nameEs} (${book.slug}) — ${chapterCount} capítulos [${config.template}: ${config.youtubeName}] ===\n`,
    );

    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      const key = String(chapter);
      if (onlyMissing && bookLinks[key]?.youtubeVideoId) {
        totalSkipped++;
        continue;
      }

      process.stdout.write(`  Cap ${chapter}/${chapterCount}... `);
      try {
        const result = await resolveChapter(book, config, chapter, bookLinks[key]);
        if (result.status === "skipped_existing") {
          process.stdout.write(`omitido (ya existe)\n`);
          totalSkipped++;
        } else if (result.status === "ok") {
          bookLinks[key] = {
            youtubeVideoId: result.videoId,
            startSecond: null,
            endSecond: null,
          };
          process.stdout.write(`OK ${result.videoId}\n`);
          totalOk++;
        } else {
          process.stdout.write(`NO ENCONTRADO\n`);
          notFoundReport.push({
            slug: book.slug,
            nameEs: book.nameEs,
            chapter,
            query: result.query,
            candidates: result.candidates,
          });
          totalMissing++;
        }
      } catch (error) {
        process.stdout.write(`ERROR ${error}\n`);
        notFoundReport.push({
          slug: book.slug,
          nameEs: book.nameEs,
          chapter,
          query: buildExpectedTitle(config, chapter),
          status: "error",
          message: String(error),
        });
        totalErrors++;
      }
      await sleep(1500);
    }

    await mkdir(path.dirname(AUDIO_MANIFEST_PATH), { recursive: true });
    await writeFile(AUDIO_MANIFEST_PATH, `${JSON.stringify(audioManifest, null, 2)}\n`, "utf-8");
  }

  await mkdir(path.dirname(AUDIO_MANIFEST_PATH), { recursive: true });
  await writeFile(AUDIO_MANIFEST_PATH, `${JSON.stringify(audioManifest, null, 2)}\n`, "utf-8");
  await writeFile(
    REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary: { totalOk, totalMissing, totalSkipped, totalErrors },
        notFound: notFoundReport,
      },
      null,
      2,
    )}\n`,
    "utf-8",
  );

  process.stdout.write(`\n--- Resumen ---\n`);
  process.stdout.write(`  Enlazados: ${totalOk}\n`);
  process.stdout.write(`  No encontrados: ${totalMissing}\n`);
  process.stdout.write(`  Omitidos (ya existían): ${totalSkipped}\n`);
  process.stdout.write(`  Errores: ${totalErrors}\n`);
  process.stdout.write(`  Manifest: ${AUDIO_MANIFEST_PATH}\n`);
  process.stdout.write(`  Informe: ${REPORT_PATH}\n`);

  if (notFoundReport.length) {
    process.stdout.write(`\n--- Capítulos sin vídeo ---\n`);
    for (const row of notFoundReport) {
      process.stdout.write(`  ${row.nameEs} cap. ${row.chapter} — ${row.query}\n`);
      if (row.candidates?.length) {
        for (const c of row.candidates) process.stdout.write(`    · ${c}\n`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
