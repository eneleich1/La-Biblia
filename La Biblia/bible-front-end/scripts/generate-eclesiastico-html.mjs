/**
 * Genera Eclesiástico 25.html y 27.html desde bible-static JSON.
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";

const BOOK_DIR = path.resolve(
  process.cwd(),
  "..",
  "00 - Antiguo Testamento",
  "28- ECLESIÁSTICO",
);
const BOOK_JSON = path.join(
  process.cwd(),
  "data",
  "bible-static",
  "es",
  "books",
  "eclesiastico.json",
);

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatVerseBlock(verse) {
  return `\t\t\t\t\t\t\t<div>
\t\t\t\t\t\t\t\t<p>
\t\t\t\t\t\t\t\t\t<a id='V${verse.verseNumber}'>${verse.verseNumber}</a>
\t\t\t\t\t\t\t\t\t ${escapeHtml(verse.text.trim())}

\t\t\t\t\t\t\t\t</p>
\t\t\t\t\t\t\t</div>`;
}

function renderColumn(verses) {
  return verses.map((v) => formatVerseBlock(v)).join("\n");
}

function navBlock(prevChapter, nextChapter) {
  return `\t\t<div class='header'>
\t\t\t<button type='button' class='btn btn-primary' onclick = 'location.assign("../../Index.html")'>
\t\t\t\t<span class='glyphicon glyphicon-home'></span>
\t\t\t</button>
\t\t\t<button type='button' class='btn btn-primary' onclick = 'location.assign("../00- Indice/28- ECLESIÁSTICO.html")'>
\t\t\t\t<span class='glyphicon glyphicon-th'></span>
\t\t\t</button>
\t\t\t<button type='button' class='btn btn-primary' onclick ='location.assign("Eclesiástico ${prevChapter}.html")'>
\t\t\t\t<span class='glyphicon glyphicon-chevron-left'></span>
\t\t\t</button>
\t\t\t<button type='button' class='btn btn-primary' onclick ='location.assign("Eclesiástico ${nextChapter}.html")'>
\t\t\t\t<span class='glyphicon glyphicon-chevron-right'></span>
\t\t\t</button>
\t\t</motion.div>`;
}

function buildChapterHtml(chapter, prevChapter, nextChapter) {
  const half = Math.ceil(chapter.verses.length / 2);
  const left = chapter.verses.slice(0, half);
  const right = chapter.verses.slice(half);
  const n = chapter.number;

  return `<!DOCTYPE html>
<html>
\t<head>
\t\t<title>Eclesiástico ${n}</title>
\t\t<meta name = 'viewport' content = 'width=device-width, initial-scale=1'></meta>
\t\t<link rel = 'stylesheet' href = '../../!Contenido/bootstraps/css/bootstrap.min.css'></link>
\t\t<link rel = 'stylesheet' href = '../../!Contenido/bootstraps/css/google_fonts.css'></link>
\t\t<script src = 'stylesheet' href = '../../!Contenido/bootstraps/js/bootstrap.min.js'></script>
\t\t<script src = 'stylesheet' href = '../../!Contenido/bootstraps/js/jquery.min.js'></script>
\t\t<link rel='stylesheet' href='../../!Contenido/css/standarPageStyle.css'></link>
\t\t<meta charset='utf-8'></meta>
\t\t<meta http-equiv='X-UA-Compatible' content='IE=edge'></meta>
\t</head>
\t<body>
${navBlock(prevChapter, nextChapter).replace("</motion.div>", "</div>")}
\t\t<div class='container-fluid text-center section'>
\t\t\t<div class='row-content'>
\t\t\t\t<div class='col-sm-3'></div>
\t\t\t\t<div class='col-sm-6 text-center'>
\t\t\t\t\t<div class='row'>
\t\t\t\t\t\t<h1 id='chapter${n}'>Eclesiástico ${n}</h1>
\t\t\t\t\t\t<div class='col-sm-6 book-page'>
${renderColumn(left)}
\t\t\t\t\t\t</div>
\t\t\t\t\t\t<div class='col-sm-6 book-page'>
${renderColumn(right)}
\t\t\t\t\t\t</div>
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t\t<div class='col-sm-3'></div>
\t\t\t</div>
\t\t</div>
${navBlock(prevChapter, nextChapter).replace("</motion.div>", "</div>")}
\t</body>
</html>
`;
}

async function main() {
  const book = JSON.parse(await readFile(BOOK_JSON, "utf-8"));
  for (const spec of [
    { number: 25, prev: 24, next: 26 },
    { number: 27, prev: 26, next: 28 },
  ]) {
    const chapter = book.chapters.find((c) => c.number === spec.number);
    if (!chapter) throw new Error(`Capítulo ${spec.number} no encontrado`);
    const outPath = path.join(BOOK_DIR, `Eclesiástico ${spec.number}.html`);
    await writeFile(outPath, buildChapterHtml(chapter, spec.prev, spec.next), "utf-8");
    console.log("Creado:", outPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
