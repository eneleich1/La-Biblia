import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTypesenseClient, VERSES_COLLECTION } from "@/lib/typesense";
import { normalizeText, tokenizeNormalized } from "@/lib/normalizeText";

export type SearchHit = {
  id: string;
  translationId: string;
  language: string;
  testament: number;
  bookId: string;
  bookSlug: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  reference: string;
  url: string;
};

export async function runVerseSearch(params: {
  q: string;
  mode: "phrase" | "word";
  language?: string;
  translationId?: string;
  testament?: number;
  bookSlug?: string;
  chapter?: number;
  perPage?: number;
}): Promise<{ hits: SearchHit[]; found: number }> {
  const client = getTypesenseClient();
  const q = params.q.trim();
  if (!q) return { hits: [], found: 0 };

  const filters: string[] = [];
  if (params.language) filters.push(`language:=${params.language}`);
  if (params.translationId) filters.push(`translationId:=${params.translationId}`);
  if (params.testament === 1 || params.testament === 2) {
    filters.push(`testament:=${params.testament}`);
  }
  if (params.bookSlug) filters.push(`bookSlug:=${params.bookSlug}`);
  if (params.chapter && params.chapter > 0) {
    filters.push(`chapterNumber:=${params.chapter}`);
  }

  const typesenseQuery =
    params.mode === "phrase" ? `"${q.replace(/"/g, '\\"')}"` : q;

  const res = await client.collections(VERSES_COLLECTION).documents().search({
    q: typesenseQuery,
    query_by: "text,normalizedText",
    filter_by: filters.length ? filters.join(" && ") : undefined,
    per_page: params.perPage ?? 25,
    page: 1,
  });

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const hits: SearchHit[] = (res.hits ?? []).map((h) => {
    const d = h.document as Record<string, unknown>;
    const translationId = String(d.translationId);
    const language = String(d.language);
    const testament = Number(d.testament);
    const bookId = String(d.bookId);
    const bookSlug = String(d.bookSlug);
    const bookName = String(d.bookName);
    const chapterNumber = Number(d.chapterNumber);
    const verseNumber = Number(d.verseNumber);
    const text = String(d.text);
    const id = String(d.id);
    const reference = `${bookName} ${chapterNumber}:${verseNumber}`;
    const url = `${site}/biblia/${language}/${bookSlug}/${chapterNumber}#V${verseNumber}`;
    return {
      id,
      translationId,
      language,
      testament,
      bookId,
      bookSlug,
      bookName,
      chapterNumber,
      verseNumber,
      text,
      reference,
      url,
    };
  });

  return { hits, found: res.found ?? hits.length };
}

export async function countExactWordOccurrences(params: {
  word: string;
  translationId?: string;
  testament?: number;
  bookSlug?: string;
}): Promise<number> {
  const normalizedWord = normalizeText(params.word);
  if (!normalizedWord || normalizedWord.includes(" ")) return 0;

  const book = params.bookSlug
    ? await prisma.book.findUnique({
        where: { slug: params.bookSlug },
        select: { id: true },
      })
    : null;

  const where: Prisma.VerseWordWhereInput = {
    normalizedWord,
    ...(params.translationId
      ? { translationId: params.translationId }
      : {}),
    ...(params.testament === 1 || params.testament === 2
      ? {
          book: { testament: params.testament },
        }
      : {}),
    ...(book ? { bookId: book.id } : {}),
  };

  return prisma.verseWord.count({ where });
}

export async function countExactPhraseOccurrences(params: {
  phrase: string;
  translationId?: string;
}): Promise<number> {
  const norm = normalizeText(params.phrase);
  const tokens = tokenizeNormalized(norm);
  if (tokens.length === 0) return 0;

  if (tokens.length === 1) {
    return countExactWordOccurrences({
      word: tokens[0],
      translationId: params.translationId,
    });
  }

  const whereVerse: Prisma.VerseWhereInput = {
    normalizedText: { contains: norm },
    ...(params.translationId
      ? { translationId: params.translationId }
      : {}),
  };

  return prisma.verse.count({ where: whereVerse });
}
