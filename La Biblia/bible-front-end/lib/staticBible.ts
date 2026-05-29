import { readFile } from "fs/promises";
import path from "path";

export type StaticTranslation = {
  name: string;
  language: string;
  abbreviation: string;
  edition?: string;
};

export type StaticBookSummary = {
  testament: number;
  order: number;
  slug: string;
  nameEs: string;
  nameEn: string | null;
  category: string | null;
  chapters: { number: number }[];
};

export type StaticVerse = {
  verseNumber: number;
  text: string;
};

export type StaticChapter = {
  number: number;
  title?: string;
  shortTitle?: string;
  verses: StaticVerse[];
};

export type StaticBook = Omit<StaticBookSummary, "chapters" | "category" | "nameEn"> & {
  chapters: StaticChapter[];
};

type StaticManifest = {
  translations: StaticTranslation[];
  books: StaticBookSummary[];
};

const STATIC_BIBLE_ROOT = path.join(process.cwd(), "data", "bible-static");
const manifestCache = new Map<string, Promise<StaticManifest>>();
const bookCache = new Map<string, Promise<StaticBook>>();

/** Legacy / short URL slugs → canonical manifest slug (filename without .json). */
const STATIC_BOOK_SLUG_ALIASES: Record<string, string> = {
  salmo: "los-salmos",
  salmos: "los-salmos",
  sal: "los-salmos",
};

export function resolveStaticBookSlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  return STATIC_BOOK_SLUG_ALIASES[normalized] ?? normalized;
}

async function readJson<T>(filePath: string): Promise<T> {
  const text = await readFile(filePath, "utf-8");
  return JSON.parse(text) as T;
}

export function getSupportedStaticLanguages() {
  return ["es"];
}

export function getStaticBibleManifest(language: string) {
  if (!manifestCache.has(language)) {
    manifestCache.set(
      language,
      readJson<StaticManifest>(path.join(STATIC_BIBLE_ROOT, language, "manifest.json")),
    );
  }
  return manifestCache.get(language)!;
}

export async function getStaticTranslations() {
  const translations = await Promise.all(
    getSupportedStaticLanguages().map(async (language) => {
      const manifest = await getStaticBibleManifest(language);
      return manifest.translations;
    }),
  );
  return translations.flat();
}

export async function getStaticTranslation(language: string) {
  const manifest = await getStaticBibleManifest(language);
  return manifest.translations.find((translation) => translation.language === language) ?? null;
}

export async function getStaticBooks(language: string) {
  const manifest = await getStaticBibleManifest(language);
  return [...manifest.books].sort(
    (a, b) => a.testament - b.testament || a.order - b.order,
  );
}

export async function getStaticBookSummary(language: string, slug: string) {
  const resolvedSlug = resolveStaticBookSlug(slug);
  const manifest = await getStaticBibleManifest(language);
  return manifest.books.find((book) => book.slug === resolvedSlug) ?? null;
}

export function getStaticBook(language: string, slug: string) {
  const resolvedSlug = resolveStaticBookSlug(slug);
  const key = `${language}:${resolvedSlug}`;
  if (!bookCache.has(key)) {
    bookCache.set(
      key,
      readJson<StaticBook>(
        path.join(STATIC_BIBLE_ROOT, language, "books", `${resolvedSlug}.json`),
      ),
    );
  }
  return bookCache.get(key)!;
}

export async function getStaticChapter(language: string, slug: string, chapterNumber: number) {
  const book = await getStaticBook(language, slug);
  return book.chapters.find((chapter) => chapter.number === chapterNumber) ?? null;
}

export async function getStaticAdjacentBooks(language: string, testament: number, order: number) {
  const books = await getStaticBooks(language);
  const index = books.findIndex((book) => book.testament === testament && book.order === order);
  return {
    prevSlug: index > 0 ? books[index - 1]?.slug ?? null : null,
    nextSlug: index >= 0 && index < books.length - 1 ? books[index + 1]?.slug ?? null : null,
  };
}

