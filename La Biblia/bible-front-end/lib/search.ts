import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTypesenseClient, VERSES_COLLECTION } from "@/lib/typesense";
import { getPublicSiteBase } from "@/lib/siteUrl";
import {
  extractWordsFromVerseText,
  normalizeText,
  tokenizeNormalized,
} from "@/lib/normalizeText";

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
  score?: number;
  matchType?: "exact" | "approximate";
  matchedWords?: string[];
};

const LOW_WEIGHT_WORDS = new Set([
  "a",
  "al",
  "ante",
  "aquel",
  "aquella",
  "aquellas",
  "aquellos",
  "aqui",
  "asi",
  "cada",
  "como",
  "con",
  "contra",
  "cual",
  "cuando",
  "de",
  "desde",
  "del",
  "donde",
  "el",
  "en",
  "entre",
  "es",
  "ese",
  "eso",
  "esta",
  "estaba",
  "estan",
  "estar",
  "estas",
  "este",
  "estos",
  "hubo",
  "la",
  "las",
  "le",
  "les",
  "lo",
  "los",
  "mas",
  "me",
  "mi",
  "mis",
  "muy",
  "ni",
  "no",
  "o",
  "para",
  "por",
  "que",
  "se",
  "segun",
  "si",
  "sin",
  "sobre",
  "su",
  "sus",
  "tambien",
  "te",
  "toda",
  "todas",
  "todo",
  "todos",
  "tu",
  "tus",
  "un",
  "una",
  "uno",
  "unos",
  "y",
]);

const SYNONYM_GROUPS = [
  ["ajeno", "otro", "extraño", "extrano"],
  ["imagen", "escultura", "representacion", "figura"],
  ["mujer", "esposa"],
  ["repudiar", "repudia", "repudie", "divorciar", "despedir"],
  ["crear", "creo", "hacer", "hizo", "formar"],
  ["cielo", "cielos"],
  ["tierra", "mundo"],
];

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
  verse?: number;
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
  if (params.verse && params.verse > 0) {
    filters.push(`verseNumber:=${params.verse}`);
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
    const url = `${site}/biblia/${language}/${bookSlug}/${chapterNumber}?highlight=${verseNumber}#V${verseNumber}`;
    const matchedWords = collectMatchedWords(queryTerms(params.q), text);
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
      matchType: "exact",
      matchedWords,
    };
  });

  return { hits, found: res.found ?? hits.length };
}

function stemApproximateToken(token: string) {
  if (/^ha(c|g|r)/.test(token)) return "hac";
  if (token.length > 5 && /(aria|eria|iria|aste|iste|ando|iendo)$/.test(token)) {
    return token.replace(/(aria|eria|iria|aste|iste|ando|iendo)$/u, "");
  }
  if (token.length > 5 && /(ado|ido|aba|ia|as|es|an|en)$/.test(token)) {
    return token.replace(/(ado|ido|aba|ia|as|es|an|en)$/u, "");
  }
  if (token.length > 5 && /[aeio]$/.test(token)) return token.slice(0, -1);
  if (token.length > 5 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function approximateTokens(value: string) {
  return tokenizeNormalized(normalizeText(value))
    .map(stemApproximateToken)
    .filter((token) => token.length > 1);
}

function uniqueTokens(tokens: string[]) {
  return [...new Set(tokens)];
}

function tokenWeight(token: string) {
  if (LOW_WEIGHT_WORDS.has(token)) return 0.34;
  if (token.length <= 2) return 0.25;
  return 1;
}

function synonymVariants(token: string) {
  const variants = new Set<string>([token]);
  for (const group of SYNONYM_GROUPS) {
    const normalizedGroup = group.map((item) => stemApproximateToken(normalizeText(item)));
    if (normalizedGroup.includes(token)) {
      for (const item of normalizedGroup) variants.add(item);
    }
  }
  return [...variants];
}

type QueryTerm = {
  token: string;
  variants: string[];
  weight: number;
};

const WORD_SIMILARITY_CACHE = new Map<string, number>();

function queryTerms(value: string): QueryTerm[] {
  return uniqueTokens(approximateTokens(value)).map((token) => ({
    token,
    variants: synonymVariants(token),
    weight: tokenWeight(token),
  }));
}

function levenshteinDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }

  return prev[b.length];
}

function wordSimilarity(a: string, b: string) {
  const cacheKey = a <= b ? `${a}:${b}` : `${b}:${a}`;
  const cached = WORD_SIMILARITY_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  let similarity: number;
  if (a === b) return 1;
  if (a.length < 4 || b.length < 4) {
    similarity = 0;
  } else if (a[0] !== b[0]) {
    similarity = 0;
  } else if (a.startsWith(b) || b.startsWith(a)) {
    similarity = 0.9;
  } else {
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    similarity = 1 - distance / maxLength;
  }

  WORD_SIMILARITY_CACHE.set(cacheKey, similarity);
  if (WORD_SIMILARITY_CACHE.size > 50000) WORD_SIMILARITY_CACHE.clear();
  return similarity;
}

function isWordMatch(queryToken: string, verseToken: string) {
  const threshold = Math.min(queryToken.length, verseToken.length) <= 5 ? 0.78 : 0.72;
  return wordSimilarity(queryToken, verseToken) >= threshold;
}

function termMatchesVerseToken(term: QueryTerm, verseToken: string) {
  return term.variants.some((variant) => isWordMatch(variant, verseToken));
}

function collectMatchedWords(terms: QueryTerm[], text: string) {
  const words = extractWordsFromVerseText(text);
  const matched = new Set<string>();

  for (const word of words) {
    const token = stemApproximateToken(word.normalizedWord);
    if (!token) continue;
    if (terms.some((term) => termMatchesVerseToken(term, token))) {
      matched.add(word.normalizedWord);
    }
  }

  return [...matched];
}

function tokenPositions(text: string) {
  return extractWordsFromVerseText(text)
    .map((word, index) => ({
      index,
      surface: word.normalizedWord,
      token: stemApproximateToken(word.normalizedWord),
    }))
    .filter((word) => word.token.length > 1);
}

function phraseAlignment(terms: QueryTerm[], text: string) {
  const verseTokens = tokenPositions(text);
  const matched = terms.map((term, queryIndex) => {
    let bestPosition: number | null = null;
    let bestSimilarity = 0;

    for (let i = 0; i < verseTokens.length; i += 1) {
      for (const variant of term.variants) {
        const similarity = wordSimilarity(variant, verseTokens[i].token);
        if (similarity > bestSimilarity && isWordMatch(variant, verseTokens[i].token)) {
          bestPosition = verseTokens[i].index;
          bestSimilarity = similarity;
          if (similarity === 1) break;
        }
      }
    }

    return bestPosition === null ? null : { queryIndex, position: bestPosition };
  }).filter((item): item is { queryIndex: number; position: number } => item !== null);

  if (!matched.length) {
    return { orderedCoverage: 0, density: 0, adjacency: 0, orderQuality: 0 };
  }

  const matchedPositions = matched.map((item) => item.position);
  const first = Math.min(...matchedPositions);
  const last = Math.max(...matchedPositions);
  const span = Math.max(1, last - first + 1);
  let orderedPairs = 0;
  let totalPairs = 0;

  for (let i = 0; i < matched.length; i += 1) {
    for (let j = i + 1; j < matched.length; j += 1) {
      totalPairs += 1;
      if (matched[i].position < matched[j].position) orderedPairs += 1;
    }
  }

  let adjacentPairs = 0;
  let adjacentTotal = 0;
  for (let i = 0; i < matched.length - 1; i += 1) {
    const current = matched[i];
    const next = matched[i + 1];
    if (next.queryIndex === current.queryIndex + 1) {
      adjacentTotal += 1;
      if (next.position > current.position && next.position - current.position <= 3) {
        adjacentPairs += 1;
      }
    }
  }

  return {
    orderedCoverage: matched.length / terms.length,
    density: matchedPositions.length / span,
    adjacency: adjacentTotal > 0 ? adjacentPairs / adjacentTotal : 0,
    orderQuality: totalPairs > 0 ? orderedPairs / totalPairs : 1,
  };
}

function approximateScore(terms: QueryTerm[], text: string) {
  const verseTokens = uniqueTokens(approximateTokens(text));
  if (!terms.length || !verseTokens.length) {
    return { score: 0, matchedWords: [] as string[] };
  }

  const totalWeight = terms.reduce((sum, term) => sum + term.weight, 0);
  const matchedTerms = terms.filter((term) =>
    verseTokens.some((verseToken) => termMatchesVerseToken(term, verseToken)),
  );
  const matchedVerseTokens = verseTokens.filter((verseToken) =>
    terms.some((term) => termMatchesVerseToken(term, verseToken)),
  );

  const matchedWeight = matchedTerms.reduce((sum, term) => sum + term.weight, 0);
  const coverage = matchedWeight / totalWeight;
  const precision = matchedVerseTokens.length / verseTokens.length;
  const phrase = phraseAlignment(terms, text);

  return {
    score:
      coverage * 0.4 +
      precision * 0.08 +
      phrase.orderedCoverage * 0.14 +
      phrase.orderQuality * 0.22 +
      phrase.density * 0.1 +
      phrase.adjacency * 0.06,
    matchedWords: collectMatchedWords(terms, text),
  };
}

function candidateFragments(token: string) {
  const fragments = new Set<string>([token]);
  if (token === "hac") {
    fragments.add("hac");
    fragments.add("hag");
    fragments.add("har");
  }
  if (token.length >= 6) fragments.add(token.slice(0, 4));
  if (token.length === 5) fragments.add(token.slice(0, 4));
  return [...fragments].filter((fragment) => fragment.length >= 3);
}

function hasCandidateFragment(text: string, fragments: string[]) {
  return fragments.some((fragment) => text.includes(fragment));
}

function insertTopHit(topHits: SearchHit[], hit: SearchHit, limit: number) {
  const existing = topHits.findIndex(
    (item) =>
      item.translationId === hit.translationId &&
      item.bookId === hit.bookId &&
      item.chapterNumber === hit.chapterNumber &&
      item.reference === hit.reference,
  );

  if (existing >= 0) {
    if ((hit.score ?? 0) > (topHits[existing].score ?? 0)) {
      topHits[existing] = hit;
    }
  } else if (topHits.length < limit) {
    topHits.push(hit);
  } else {
    let worstIndex = 0;
    for (let i = 1; i < topHits.length; i += 1) {
      if ((topHits[i].score ?? 0) < (topHits[worstIndex].score ?? 0)) {
        worstIndex = i;
      }
    }

    if ((hit.score ?? 0) > (topHits[worstIndex].score ?? 0)) {
      topHits[worstIndex] = hit;
    }
  }

  topHits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export async function runApproximateVerseSearch(params: {
  q: string;
  language?: string;
  translationId?: string;
  testament?: number;
  bookSlug?: string;
  chapter?: number;
  verse?: number;
  limit?: number;
}): Promise<{ hits: SearchHit[]; found: number }> {
  const terms = queryTerms(params.q);
  if (!terms.length) return { hits: [], found: 0 };

  const candidateTokens = uniqueTokens(
    terms.flatMap((term) => term.variants).filter((token) => tokenWeight(token) >= 0.34),
  );
  const candidateFragmentList = uniqueTokens(
    candidateTokens.slice(0, 14).flatMap((token) => candidateFragments(token)),
  );
  const tokenFilters = candidateFragmentList.map((fragment) => ({
    normalizedText: { contains: fragment, mode: "insensitive" as const },
  }));

  const verses = await prisma.verse.findMany({
    where: {
      ...(params.translationId ? { translationId: params.translationId } : {}),
      ...(params.chapter && params.chapter > 0 ? { chapterNumber: params.chapter } : {}),
      ...(params.verse && params.verse > 0 ? { verseNumber: params.verse } : {}),
      translation: {
        ...(params.language ? { language: params.language } : {}),
        isPublic: true,
      },
      book: {
        ...(params.testament === 1 || params.testament === 2
          ? { testament: params.testament }
          : {}),
        ...(params.bookSlug ? { slug: params.bookSlug } : {}),
      },
      ...(tokenFilters.length ? { OR: tokenFilters } : {}),
    },
    include: {
      book: true,
      translation: true,
    },
    orderBy: [
      { book: { testament: "asc" } },
      { book: { order: "asc" } },
      { chapterNumber: "asc" },
      { verseNumber: "asc" },
    ],
  });

  const topHits: SearchHit[] = [];
  const topLimit = Math.max(params.limit ?? 10, 20);
  const site = getPublicSiteBase();

  for (let i = 0; i < verses.length; i += 1) {
    const first = verses[i];
    const grouped = [first];

    for (let j = i + 1; j < verses.length && grouped.length < 3; j += 1) {
      const next = verses[j];
      const prev = grouped[grouped.length - 1];
      if (
        next.translationId !== first.translationId ||
        next.bookId !== first.bookId ||
        next.chapterNumber !== first.chapterNumber ||
        next.verseNumber !== prev.verseNumber + 1
      ) {
        break;
      }
      grouped.push(next);
    }

    for (let size = 1; size <= grouped.length; size += 1) {
      const chunk = grouped.slice(0, size);
      const text = chunk.map((verse) => verse.text.trim()).join(" ");
      const normalizedWindow = normalizeText(text);
      if (!hasCandidateFragment(normalizedWindow, candidateFragmentList)) continue;

      const { score, matchedWords } = approximateScore(terms, text);
      if (score <= 0) continue;

      const last = chunk[chunk.length - 1];
      const reference =
        first.verseNumber === last.verseNumber
          ? `${first.book.nameEs} ${first.chapterNumber}:${first.verseNumber}`
          : `${first.book.nameEs} ${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;

      insertTopHit(topHits, {
        id: `approx-${first.id}-${last.id}`,
        translationId: first.translationId,
        language: first.translation.language,
        testament: first.book.testament,
        bookId: first.bookId,
        bookSlug: first.book.slug,
        bookName: first.book.nameEs,
        chapterNumber: first.chapterNumber,
        verseNumber: first.verseNumber,
        text,
        reference,
        url:
          first.verseNumber === last.verseNumber
            ? `${site}/biblia/${first.translation.language}/${first.book.slug}/${first.chapterNumber}?highlight=${first.verseNumber}#V${first.verseNumber}`
            : `${site}/biblia/${first.translation.language}/${first.book.slug}/${first.chapterNumber}?highlight=${first.verseNumber}-${last.verseNumber}#V${first.verseNumber}`,
        score: Math.round(score * 100),
        matchType: "approximate",
        matchedWords,
      }, topLimit);
    }
  }

  const hits = topHits.slice(0, params.limit ?? 10);
  return { hits, found: hits.length };
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
