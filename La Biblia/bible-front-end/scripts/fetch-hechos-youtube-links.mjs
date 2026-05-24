/**
 * Busca en YouTube (HTML público, sin API) los vídeos de Hechos
 * con título "La Biblia de Jerusalen Audio Es Hechos {n}".
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const BOOK_SLUG = "hechos-de-los-apostoles";
const CHAPTERS = 28;
const TITLE_PREFIX = "La Biblia de Jerusalen Audio Es Hechos";

function normalizeTitle(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function expectedTitle(chapter) {
  return `${TITLE_PREFIX} ${chapter}`;
}

function scoreMatch(resultTitle, chapter) {
  const norm = normalizeTitle(resultTitle);
  const expected = normalizeTitle(expectedTitle(chapter));

  if (norm === expected) return 100;
  if (norm.includes(expected)) return 90;
  if (norm.includes("jerusalen") && norm.includes("audio") && norm.includes(`hechos ${chapter}`)) {
    return 80;
  }
  if (norm.includes("jerusalen") && norm.includes("audio") && norm.includes("hechos")) {
    const match = norm.match(/hechos\s*(\d+)/);
    if (match && Number(match[1]) === chapter) return 70;
  }
  if (
    norm.includes("jerusalen") &&
    norm.includes("audio") &&
    norm.includes("hechos") &&
    new RegExp(`\\b${chapter}\\b`).test(norm)
  ) {
    return 65;
  }
  return 0;
}

async function searchYouTube(query, attempt = 1) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });
  } catch (error) {
    if (attempt < 4) {
      await sleep(2000 * attempt);
      return searchYouTube(query, attempt + 1);
    }
    throw error;
  }
  if (!res.ok) throw new Error(`YouTube HTTP ${res.status} for ${query}`);
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
  const count = Math.min(titles.length, ids.length);
  for (let i = 0; i < count; i++) {
    const id = ids[i];
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({ videoId: id, title: titles[i] });
  }
  return results;
}

function pickBest(results, chapter) {
  let best = null;
  let bestScore = 0;
  for (const result of results) {
    const score = scoreMatch(result.title, chapter);
    if (score > bestScore) {
      bestScore = score;
      best = result;
    }
  }
  return bestScore >= 65 ? best : null;
}

async function resolveChapter(chapter) {
  const query = expectedTitle(chapter);
  const results = await searchYouTube(query);
  const match = pickBest(results, chapter);
  if (match) {
    return { chapter, ...match, query, status: "ok" };
  }
  return {
    chapter,
    query,
    status: "not_found",
    candidates: results.slice(0, 5),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadExistingLinks() {
  const manifestPath = path.join(process.cwd(), "data", "audio-static", "es", "manifest.json");
  try {
    const raw = await readFile(manifestPath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed.links?.[BOOK_SLUG] ?? {};
  } catch {
    return {};
  }
}

async function main() {
  const links = await loadExistingLinks();
  const report = [];
  const onlyMissing = process.argv.includes("--missing");

  for (let chapter = 1; chapter <= CHAPTERS; chapter++) {
    if (onlyMissing && links[String(chapter)]) {
      process.stdout.write(`Capítulo ${chapter}: ya enlazado, omitido.\n`);
      continue;
    }
    process.stdout.write(`Buscando capítulo ${chapter}/${CHAPTERS}...\n`);
    try {
      const result = await resolveChapter(chapter);
      report.push(result);
      if (result.status === "ok") {
        links[String(chapter)] = {
          youtubeVideoId: result.videoId,
          startSecond: null,
          endSecond: null,
        };
        process.stdout.write(`  ✓ ${result.title} (${result.videoId})\n`);
      } else {
        process.stdout.write(`  ✗ No encontrado\n`);
        for (const c of result.candidates ?? []) {
          process.stdout.write(`    - ${c.title}\n`);
        }
      }
    } catch (error) {
      report.push({ chapter, status: "error", message: String(error) });
      process.stdout.write(`  ✗ Error: ${error}\n`);
    }
    await sleep(2800);
  }

  const outDir = path.join(process.cwd(), "data", "audio-static", "es");
  await mkdir(outDir, { recursive: true });

  const manifestPath = path.join(outDir, "manifest.json");
  let existingManifest = { links: {} };
  try {
    existingManifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  } catch {
    // nuevo manifest
  }
  const manifest = {
    links: {
      ...existingManifest.links,
      [BOOK_SLUG]: links,
    },
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

  const reportPath = path.join(outDir, "hechos-fetch-report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

  const found = Object.keys(links).length;
  process.stdout.write(`\nListo: ${found}/${CHAPTERS} capítulos → ${manifestPath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
