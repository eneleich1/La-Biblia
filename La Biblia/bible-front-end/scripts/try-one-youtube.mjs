import { readFile, writeFile } from "fs/promises";
import path from "path";

const queries = [
  "La Biblia de Jerusalen Audio Es Filipenses 4",
  "La Biblia de Jerusalen Audio Es  Filipenses 4",
  "Jerusalen 1976 Audio Esp Filipenses 4",
];

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "es-ES,es;q=0.9",
    },
  });
  const html = await res.text();
  const titleRegex = /"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"\}/g;
  const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  const titles = [...html.matchAll(titleRegex)].map((m) =>
    m[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"'),
  );
  const ids = [...html.matchAll(idRegex)].map((m) => m[1]);
  const out = [];
  const seen = new Set();
  for (let i = 0; i < Math.min(12, titles.length, ids.length); i++) {
    if (seen.has(ids[i])) continue;
    seen.add(ids[i]);
    out.push({ id: ids[i], title: titles[i] });
  }
  return out;
}

for (const q of queries) {
  console.log("\nQUERY:", q);
  const r = await searchYouTube(q);
  for (const x of r) console.log(" ", x.id, x.title);
}
