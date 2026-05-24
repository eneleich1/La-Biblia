import { normalizeText } from "@/lib/normalizeText";

export type DailyReadingSectionKind = "first" | "psalm" | "second" | "gospel";

export type DailyReadingSection = {
  kind: DailyReadingSectionKind;
  label: string;
  reference: string;
  href?: string;
};

export type DailyReading = {
  date: string;
  displayDate: string;
  celebration: string;
  isSundayLike: boolean;
  sections: DailyReadingSection[];
  sourceName: string;
  sourceUrl: string;
  supplementalSourceName?: string;
  supplementalSourceUrl?: string;
};

type CachedReading = {
  expiresAt: number;
  reading: DailyReading;
};

const cache = new Map<string, CachedReading>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const DEFAULT_TIME_ZONE = "America/New_York";

const SECTION_LABELS: Record<DailyReadingSectionKind, string> = {
  first: "Primera lectura",
  psalm: "Salmo responsorial",
  second: "Segunda lectura",
  gospel: "Evangelio",
};

const BOOK_SLUG_BY_NORMALIZED_NAME: Record<string, string> = {
  genesis: "genesis",
  gn: "genesis",
  exodo: "exodo",
  ex: "exodo",
  levitico: "levitico",
  lv: "levitico",
  numeros: "numeros",
  nm: "numeros",
  deuteronomio: "deuteronomio",
  dt: "deuteronomio",
  josue: "josue",
  jos: "josue",
  jueces: "jueces",
  jc: "jueces",
  rut: "rut",
  "1 samuel": "libro-primero-de-samuel",
  "2 samuel": "libro-segundo-de-samuel",
  "1 reyes": "libro-primero-de-los-reyes",
  "2 reyes": "libro-segundo-de-los-reyes",
  "1 cronicas": "libro-primero-de-las-cronicas",
  "2 cronicas": "libro-segundo-de-las-cronicas",
  esdras: "esdras",
  nehemias: "nehemias",
  tobias: "tobias",
  judit: "judit",
  ester: "ester",
  "1 macabeos": "i-macabeos",
  "2 macabeos": "ii-macabeos",
  job: "job",
  salmo: "los-salmos",
  salmos: "los-salmos",
  sal: "los-salmos",
  proverbios: "proverbios",
  prov: "proverbios",
  eclesiastes: "eclesiastes",
  qohelet: "eclesiastes",
  cantar: "cantar",
  "cantar de los cantares": "cantar",
  sabiduria: "sabiduria",
  eclesiastico: "eclesiastico",
  siracida: "eclesiastico",
  isaias: "isaias",
  is: "isaias",
  jeremias: "jeremias",
  jr: "jeremias",
  lamentaciones: "lamentaciones",
  lam: "lamentaciones",
  baruc: "baruc",
  ba: "baruc",
  ezequiel: "ezequiel",
  ez: "ezequiel",
  daniel: "daniel",
  dn: "daniel",
  oseas: "oseas",
  joel: "joel",
  amos: "amos",
  abdias: "abdias",
  jonas: "jonas",
  miqueas: "miqueas",
  nahum: "nahum",
  habacuc: "habacuc",
  sofonias: "sofonias",
  ageo: "ageo",
  zacarias: "zacarias",
  malaquias: "malaquias",
  mateo: "evangelio-segun-san-mateo",
  mt: "evangelio-segun-san-mateo",
  marcos: "evangelio-segun-san-marcos",
  mc: "evangelio-segun-san-marcos",
  lucas: "evangelio-segun-san-lucas",
  lc: "evangelio-segun-san-lucas",
  juan: "evangelio-segun-san-juan",
  jn: "evangelio-segun-san-juan",
  hechos: "hechos-de-los-apostoles",
  "hechos de los apostoles": "hechos-de-los-apostoles",
  hch: "hechos-de-los-apostoles",
  romanos: "epistola-a-los-romanos",
  rom: "epistola-a-los-romanos",
  "1 corintios": "primera-epistola-a-los-corintios",
  "1 co": "primera-epistola-a-los-corintios",
  "2 corintios": "segunda-epistola-a-los-corintios",
  "2 co": "segunda-epistola-a-los-corintios",
  galatas: "epistola-a-los-galatas",
  gal: "epistola-a-los-galatas",
  efesios: "epistola-a-los-efesios",
  ef: "epistola-a-los-efesios",
  filipenses: "epistola-a-los-filipenses",
  flp: "epistola-a-los-filipenses",
  colosenses: "epistola-a-los-colosenses",
  col: "epistola-a-los-colosenses",
  "1 tesalonicenses": "primera-epistola-a-los-tesalonicenses",
  "2 tesalonicenses": "segunda-epistola-a-los-tesalonicenses",
  "1 timoteo": "primera-epistola-a-timoteo",
  "2 timoteo": "segunda-epistola-a-timoteo",
  tito: "epistola-a-tito",
  filemon: "epistola-a-filemon",
  hebreos: "epistola-a-los-hebreos",
  heb: "epistola-a-los-hebreos",
  santiago: "epistola-de-santiago",
  sant: "epistola-de-santiago",
  "1 pedro": "primera-epistola-de-san-pedro",
  "2 pedro": "segunda-epistola-de-san-pedro",
  "1 juan": "primera-epistola-de-san-juan",
  "2 juan": "segunda-epistola-de-san-juan",
  "3 juan": "tercera-epistola-de-san-juan",
  judas: "epistola-de-san-judas",
  apocalipsis: "apocalipsis",
  ap: "apocalipsis",
};

const VATICAN_BASE_URL = "https://www.vaticannews.va/es/evangelio-de-hoy";
const ACI_BASE_URL = "https://www.aciprensa.com/calendario";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getTodayDateKey(timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return new Date().toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function formatDisplayDate(dateKey: string) {
  const dateParts = parseDateKey(dateKey);
  if (!dateParts) return dateKey;

  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day)));
}

function buildVaticanUrl(dateKey: string) {
  const dateParts = parseDateKey(dateKey);
  if (!dateParts) throw new Error("Invalid date format. Use YYYY-MM-DD.");

  return `${VATICAN_BASE_URL}/${dateParts.year}/${pad(dateParts.month)}/${pad(dateParts.day)}.html`;
}

function buildAciUrl(dateKey: string) {
  const dateParts = parseDateKey(dateKey);
  if (!dateParts) throw new Error("Invalid date format. Use YYYY-MM-DD.");

  return `${ACI_BASE_URL}/${dateParts.year}-${pad(dateParts.month)}-${pad(dateParts.day)}`;
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => entities[name.toLowerCase()] ?? entity);
}

function htmlToLines(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "\n")
    .replace(/<\/?(?:h[1-6]|p|div|section|article|li|ul|ol|br|tr|td|th|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return decodeHtml(text)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function findLineIndex(lines: string[], pattern: RegExp, startIndex = 0) {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (pattern.test(lines[index])) return index;
  }

  return -1;
}

function extractReference(lines: string[]) {
  const referencePattern =
    /^(?:\d\s*)?[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ. ]+\s+\d+[,:\s]\s*[\dA-Za-zÁÉÍÓÚÜÑáéíóúüñ().;,:\-\s]+$/;

  return lines.find((line) => referencePattern.test(line)) ?? "";
}

function normalizeBookName(rawBook: string) {
  return normalizeText(
    rawBook
      .replace(/^primera\s+/i, "1 ")
      .replace(/^segunda\s+/i, "2 ")
      .replace(/^tercera\s+/i, "3 ")
      .replace(/^1a\s+/i, "1 ")
      .replace(/^2a\s+/i, "2 ")
      .replace(/^3a\s+/i, "3 ")
      .replace(/^i\s+/i, "1 ")
      .replace(/^ii\s+/i, "2 ")
      .replace(/^iii\s+/i, "3 "),
  );
}

function buildInternalHref(reference: string) {
  const normalizedReference = reference
    .replace(/\b(?:cf|cfr)\.?\s+/gi, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const match = /^(.*?)\s+(\d+)(?:\s*\([^)]+\))?\s*[,.:]\s*(\d+)[a-z]?(?:\s*-\s*(\d+)[a-z]?)?/i.exec(normalizedReference);

  if (!match) return undefined;

  const slug = BOOK_SLUG_BY_NORMALIZED_NAME[normalizeBookName(match[1])];
  const chapter = Number(match[2]);
  const startVerse = Number(match[3]);
  const endVerse = match[4] ? Number(match[4]) : startVerse;

  if (!slug || !chapter || !startVerse || endVerse < startVerse) return undefined;

  const highlight = endVerse === startVerse ? String(startVerse) : `${startVerse}-${endVerse}`;
  return `/biblia/es/${slug}/${chapter}?highlight=${highlight}#V${startVerse}`;
}

function isSundayLike(dateKey: string, celebration: string, sections: DailyReadingSection[]) {
  const dateParts = parseDateKey(dateKey);
  const isSunday = dateParts
    ? new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day)).getUTCDay() === 0
    : false;

  return (
    isSunday ||
    sections.some((section) => section.kind === "second") ||
    /domingo|solemnidad/i.test(celebration)
  );
}

function upsertSection(
  sections: DailyReadingSection[],
  kind: DailyReadingSectionKind,
  reference: string,
) {
  if (!reference || sections.some((section) => section.kind === kind)) return;
  sections.push({ kind, label: SECTION_LABELS[kind], reference, href: buildInternalHref(reference) });
}

function getBlock(lines: string[], startPattern: RegExp, endPatterns: RegExp[]) {
  const start = findLineIndex(lines, startPattern);
  if (start === -1) return [];

  let end = lines.length;
  for (const pattern of endPatterns) {
    const next = findLineIndex(lines, pattern, start + 1);
    if (next !== -1) end = Math.min(end, next);
  }

  return lines.slice(start + 1, end);
}

function parseVaticanReading(html: string, dateKey: string, sourceUrl: string): DailyReading {
  const lines = htmlToLines(html);
  const titleIndex = findLineIndex(lines, /^Palabra del día$/i);
  const dateIndex = findLineIndex(lines, /^Fecha\d{2}\/\d{2}\/\d{4}$/i, Math.max(titleIndex, 0));
  const introIndex = findLineIndex(lines, /^La Palabra del día/i, Math.max(dateIndex, 0));
  const celebration =
    dateIndex !== -1 && introIndex !== -1
      ? lines.slice(dateIndex + 1, introIndex).find(Boolean) ?? "Lecturas litúrgicas del día"
      : "Lecturas litúrgicas del día";

  const readingBlock = getBlock(lines, /^Lectura del Día$/i, [/^Evangelio del Día$/i]);
  const gospelBlock = getBlock(lines, /^Evangelio del Día$/i, [
    /^Las palabras de los Papas$/i,
    /^Otros eventos programados/i,
  ]);
  const sections: DailyReadingSection[] = [];
  const firstIndex = findLineIndex(readingBlock, /^Primera lectura$/i);
  const secondIndex = findLineIndex(readingBlock, /^Segunda lectura$/i);

  if (firstIndex !== -1) {
    const firstBlock =
      secondIndex !== -1
        ? readingBlock.slice(firstIndex + 1, secondIndex)
        : readingBlock.slice(firstIndex + 1);
    upsertSection(sections, "first", extractReference(firstBlock));
  } else {
    upsertSection(sections, "first", extractReference(readingBlock));
  }

  if (secondIndex !== -1) {
    upsertSection(sections, "second", extractReference(readingBlock.slice(secondIndex + 1)));
  }

  upsertSection(sections, "gospel", extractReference(gospelBlock));

  return {
    date: dateKey,
    displayDate: formatDisplayDate(dateKey),
    celebration,
    isSundayLike: isSundayLike(dateKey, celebration, sections),
    sections,
    sourceName: "Vatican News",
    sourceUrl,
  } satisfies DailyReading;
}

function parseAciSections(html: string) {
  const lines = htmlToLines(html);
  const sectionStarts: Array<[DailyReadingSectionKind, RegExp]> = [
    ["first", /^Primera Lectura$/i],
    ["psalm", /^Salmo Responsorial$/i],
    ["second", /^Segunda Lectura$/i],
    ["gospel", /^Evangelio$/i],
  ];
  const starts = sectionStarts
    .map(([kind, pattern]) => ({ kind, index: findLineIndex(lines, pattern) }))
    .filter((item) => item.index !== -1)
    .sort((a, b) => a.index - b.index);

  const sections: DailyReadingSection[] = [];
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1]?.index ?? lines.length;
    upsertSection(sections, start.kind, extractReference(lines.slice(start.index + 1, end)));
  }

  return sections;
}

function sortSections(sections: DailyReadingSection[]) {
  const order: Record<DailyReadingSectionKind, number> = {
    first: 0,
    psalm: 1,
    second: 2,
    gospel: 3,
  };

  return [...sections].sort((a, b) => order[a.kind] - order[b.kind]);
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "La-Biblia-de-Jerusalen/1.0 (+https://local)",
      accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`Unable to load ${url}: ${response.status}`);
  }

  return response.text();
}

export async function getDailyReading(dateKey = getTodayDateKey()) {
  const cached = cache.get(dateKey);
  if (cached && cached.expiresAt > Date.now()) return cached.reading;

  const sourceUrl = buildVaticanUrl(dateKey);
  const supplementalSourceUrl = buildAciUrl(dateKey);
  const vaticanHtml = await fetchHtml(sourceUrl);
  const reading = parseVaticanReading(vaticanHtml, dateKey, sourceUrl);

  try {
    const aciHtml = await fetchHtml(supplementalSourceUrl);
    const aciSections = parseAciSections(aciHtml);
    for (const section of aciSections) {
      upsertSection(reading.sections, section.kind, section.reference);
    }
    reading.sections = sortSections(reading.sections);
    reading.supplementalSourceName = "ACI Prensa";
    reading.supplementalSourceUrl = supplementalSourceUrl;
    reading.isSundayLike = isSundayLike(dateKey, reading.celebration, reading.sections);
  } catch {
    reading.sections = sortSections(reading.sections);
  }

  cache.set(dateKey, { expiresAt: Date.now() + CACHE_TTL_MS, reading });
  return reading;
}
