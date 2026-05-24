import { readFile, writeFile } from "fs/promises";
import path from "path";

const LOG_PATH = process.argv[2] ?? path.join(process.cwd(), "data", "audio-static", "es", "fetch-log.txt");
const AUDIO_MANIFEST_PATH = path.join(process.cwd(), "data", "audio-static", "es", "manifest.json");

async function main() {
  const log = await readFile(LOG_PATH, "utf-8");
  const lines = log.split(/\r?\n/);

  let manifest = { links: {} };
  try {
    manifest = JSON.parse(await readFile(AUDIO_MANIFEST_PATH, "utf-8"));
  } catch {
    /* keep hechos if any */
  }
  if (!manifest.links) manifest.links = {};

  let slug = null;
  let recovered = 0;

  for (const line of lines) {
    const bookMatch = line.match(/\(([\w-]+)\)\s/);
    if (line.startsWith("===") && bookMatch) {
      slug = bookMatch[1];
      if (!manifest.links[slug]) manifest.links[slug] = {};
      continue;
    }
    const okMatch = line.match(/Cap\s+(\d+)\/\d+\.\.\.\s+OK\s+([a-zA-Z0-9_-]{11})/);
    if (slug && okMatch) {
      manifest.links[slug][okMatch[1]] = {
        youtubeVideoId: okMatch[2],
        startSecond: null,
        endSecond: null,
      };
      recovered++;
    }
  }

  await writeFile(AUDIO_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  const books = Object.keys(manifest.links).length;
  process.stdout.write(`Recuperados ${recovered} enlaces en ${books} libros → ${AUDIO_MANIFEST_PATH}\n`);
}

main();
