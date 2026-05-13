import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTypesenseClient, VERSES_COLLECTION } from "@/lib/typesense";
import { getPublicSiteBase } from "@/lib/siteUrl";
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

/** Typesense query string: phrase uses quotes; word mode uses normalized tokens (matches `normalizedText`). */
function buildTypesenseQuery(q: string, mode: "phrase" | "word"): string {
  const norm = normalizeText(q);
  if (!norm) return "";
  if (mode === "phrase") {
    const escaped = norm.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return norm;
}

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
  const typesenseQuery = buildTypesenseQuery(params.q, params.mode);
  if (!typesenseQuery) return { hits: [], found: 0 };

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

  const res = await client.collections(VERSES_COLLECTION).documents().search({
    q: typesenseQuery,
    query_by: "normalizedText,text",
    filter_by: filters.length ? filters.join(" && ") : undefined,
    per_page: params.perPage ?? 25,
    page: 1,
  });

  const site = getPublicSiteBase();

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

/**
 * Exact multi-word phrase: consecutive normalized tokens in `VerseWord` for the same verse
 * (order preserved by insertion / `id` order from `verse-words` script).
 */
export async function countExactPhraseOccurrences(params: {
  phrase: string;
  translationId?: string;
  testament?: number;
  bookSlug?: string;
}): Promise<number> {
  const norm = normalizeText(params.phrase);
  const tokens = tokenizeNormalized(norm);
  if (tokens.length === 0) return 0;

  if (tokens.length === 1) {
    return countExactWordOccurrences({
      word: tokens[0],
      translationId: params.translationId,
      testament: params.testament,
      bookSlug: params.bookSlug,
    });
  }

  const needle = ` ${norm} `;

  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS "count"
    FROM (
      SELECT vw."translationId", vw."bookId", vw."chapterNumber", vw."verseNumber"
      FROM "VerseWord" vw
      INNER JOIN "Book" b ON b.id = vw."bookId"
      WHERE 1 = 1
        ${params.translationId ? Prisma.sql`AND vw."translationId" = ${params.translationId}` : Prisma.empty}
        ${params.testament === 1 || params.testament === 2 ? Prisma.sql`AND b."testament" = ${params.testament}` : Prisma.empty}
        ${params.bookSlug ? Prisma.sql`AND b."slug" = ${params.bookSlug}` : Prisma.empty}
      GROUP BY vw."translationId", vw."bookId", vw."chapterNumber", vw."verseNumber"
      HAVING POSITION(${needle} IN CONCAT(' ', array_to_string(array_agg(vw."normalizedWord" ORDER BY vw."id"), ' '), ' ')) > 0
    ) sub
  `;

  return Number(rows[0]?.count ?? 0);
}
