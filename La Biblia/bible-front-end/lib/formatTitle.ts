function capitalizeWord(word: string) {
  if (/^[ivxlcdm]+$/i.test(word)) return word.toLocaleUpperCase("es");

  const lower = word.toLocaleLowerCase("es");
  const chars = Array.from(lower);
  if (!chars.length) return lower;

  return `${chars[0].toLocaleUpperCase("es")}${chars.slice(1).join("")}`;
}

export function formatBookTitle(title: string) {
  return title.replace(/\p{L}[\p{L}\p{M}]*/gu, (word) => capitalizeWord(word));
}

export function formatBookTitleWithRomanAfterDash(title: string) {
  return formatBookTitle(title);
}

export type BookTitleMode = "short" | "long";

export type BookTitleSegment = { text: string; bold: boolean };

function splitLongBookTitleForGroupedIndex(formatted: string): BookTitleSegment[] {
  const patterns: { re: RegExp; groups: ("plain" | "bold")[] }[] = [
    { re: /^([IVXLCDM]+)(\s+)(.+)$/i, groups: ["bold", "plain", "bold"] },
    {
      re: /^(Libro\s+(?:Primero|Segundo)\s+[Dd]e\s+(?:Los\s+|Las\s+)?)(.+)$/i,
      groups: ["plain", "bold"],
    },
    { re: /^(Evangelio\s+Seg[uú]n\s+San\s+)(.+)$/i, groups: ["plain", "bold"] },
    {
      re: /^((?:Primera|Segunda|Tercera)\s+Ep[ií]stola\s+(?:A\s+Los\s+|A\s+|De\s+San\s+))(.+)$/i,
      groups: ["plain", "bold"],
    },
    {
      re: /^(Ep[ií]stola\s+(?:A\s+Los\s+|A\s+|De\s+(?:San\s+)?))(.+)$/i,
      groups: ["plain", "bold"],
    },
    { re: /^(Hechos\s+[Dd]e\s+[Ll]os\s+)(.+)$/i, groups: ["plain", "bold"] },
    { re: /^(Cantar\s+[Dd]e\s+[Ll]os\s+)(.+)$/i, groups: ["plain", "bold"] },
    { re: /^(Los\s+)(.+)$/i, groups: ["plain", "bold"] },
  ];

  for (const { re, groups } of patterns) {
    const match = re.exec(formatted);
    if (!match) continue;

    const segments: BookTitleSegment[] = [];
    for (let i = 0; i < groups.length; i++) {
      const text = match[i + 1];
      if (!text) continue;
      segments.push({ text, bold: groups[i] === "bold" });
    }
    return segments;
  }

  return [{ text: formatted, bold: false }];
}

export function splitBookTitleForGroupedIndex(formatted: string): BookTitleSegment[] {
  return splitLongBookTitleForGroupedIndex(formatted);
}

const shortBookTitlesBySlug: Record<string, string> = {
  "libro-primero-de-samuel": "1 Samuel",
  "libro-segundo-de-samuel": "2 Samuel",
  "libro-primero-de-los-reyes": "1 Reyes",
  "libro-segundo-de-los-reyes": "2 Reyes",
  "libro-primero-de-las-cronicas": "1 Cronicas",
  "libro-segundo-de-las-cronicas": "2 Cronicas",
  "los-salmos": "Salmos",
  "evangelio-segun-san-mateo": "Mateo",
  "evangelio-segun-san-marcos": "Marcos",
  "evangelio-segun-san-lucas": "Lucas",
  "evangelio-segun-san-juan": "Juan",
  "hechos-de-los-apostoles": "Hechos",
  "epistola-a-los-romanos": "Romanos",
  "primera-epistola-a-los-corintios": "1 Corintios",
  "segunda-epistola-a-los-corintios": "2 Corintios",
  "epistola-a-los-galatas": "Galatas",
  "epistola-a-los-efesios": "Efesios",
  "epistola-a-los-filipenses": "Filipenses",
  "epistola-a-los-colosenses": "Colosenses",
  "primera-epistola-a-los-tesalonicenses": "1 Tesalonicenses",
  "segunda-epistola-a-los-tesalonicenses": "2 Tesalonicenses",
  "primera-epistola-a-timoteo": "1 Timoteo",
  "segunda-epistola-a-timoteo": "2 Timoteo",
  "epistola-a-tito": "Tito",
  "epistola-a-filemon": "Filemon",
  "epistola-a-los-hebreos": "Hebreos",
  "epistola-de-santiago": "Santiago",
  "primera-epistola-de-san-pedro": "1 Pedro",
  "segunda-epistola-de-san-pedro": "2 Pedro",
  "primera-epistola-de-san-juan": "1 Juan",
  "segunda-epistola-de-san-juan": "2 Juan",
  "tercera-epistola-de-san-juan": "3 Juan",
  "epistola-de-san-judas": "Judas",
};

function shortenBookTitle(title: string) {
  return title
    .replace(/^Libro\s+/i, "")
    .replace(/^Evangelio\s+Seg[u\u00fa]n\s+San\s+/i, "")
    .replace(/^Ep[i\u00ed]stola\s+A\s+Los\s+/i, "")
    .replace(/^Ep[i\u00ed]stola\s+A\s+/i, "")
    .replace(/^Ep[i\u00ed]stola\s+De\s+San\s+/i, "")
    .replace(/^Ep[i\u00ed]stola\s+De\s+/i, "")
    .replace(/^Primera\s+Ep[i\u00ed]stola\s+A\s+Los\s+/i, "1 ")
    .replace(/^Segunda\s+Ep[i\u00ed]stola\s+A\s+Los\s+/i, "2 ")
    .replace(/^Primera\s+Ep[i\u00ed]stola\s+A\s+/i, "1 ")
    .replace(/^Segunda\s+Ep[i\u00ed]stola\s+A\s+/i, "2 ")
    .replace(/^Primera\s+Ep[i\u00ed]stola\s+De\s+San\s+/i, "1 ")
    .replace(/^Segunda\s+Ep[i\u00ed]stola\s+De\s+San\s+/i, "2 ")
    .replace(/^Tercera\s+Ep[i\u00ed]stola\s+De\s+San\s+/i, "3 ")
    .replace(/^Los\s+Salmos$/i, "Salmos")
    .replace(/^Primero\s+De\s+/i, "1 ")
    .replace(/^Segundo\s+De\s+/i, "2 ")
    .replace(/^Primero\s+/i, "1 ")
    .replace(/^Segundo\s+/i, "2 ");
}

export function formatBibleBookTitle(
  title: string,
  slug?: string,
  mode: BookTitleMode = "short",
) {
  const formatted = formatBookTitleWithRomanAfterDash(title);
  if (mode === "long") return formatted;
  return slug && shortBookTitlesBySlug[slug]
    ? shortBookTitlesBySlug[slug]
    : shortenBookTitle(formatted);
}

export function formatBibleReference(
  reference: string,
  href?: string,
  mode: BookTitleMode = "short",
) {
  const hrefMatch = href?.match(/\/biblia\/es\/([^/]+)\/(\d+)/);
  const slug = hrefMatch?.[1];
  const chapter = hrefMatch?.[2];

  if (!slug || !chapter) return formatBookTitleWithRomanAfterDash(reference);

  const referenceMatch = new RegExp(`^(.*?)\\s+${chapter}(\\b.*)$`, "i").exec(reference.trim());
  if (!referenceMatch) return formatBookTitleWithRomanAfterDash(reference);

  const bookTitle = formatBibleBookTitle(referenceMatch[1], slug, mode);
  return `${bookTitle} ${chapter}${referenceMatch[2]}`;
}
