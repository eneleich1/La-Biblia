import { NextRequest, NextResponse } from "next/server";
import {
  countExactPhraseOccurrences,
  countExactWordOccurrences,
  runApproximateVerseSearch,
  runVerseSearch,
} from "@/lib/search";
import { normalizeText, tokenizeNormalized } from "@/lib/normalizeText";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const mode = searchParams.get("mode") === "word" ? "word" : "phrase";
  const language = searchParams.get("language") ?? undefined;
  const testamentRaw = searchParams.get("testament");
  const testament =
    testamentRaw === "1" || testamentRaw === "2"
      ? parseInt(testamentRaw, 10)
      : undefined;
  const bookSlug = searchParams.get("bookSlug") ?? undefined;
  const chapterRaw = searchParams.get("chapter");
  const chapter = chapterRaw ? parseInt(chapterRaw, 10) : undefined;
  const verseRaw = searchParams.get("verse");
  const verse = verseRaw ? parseInt(verseRaw, 10) : undefined;
  const exactWord = searchParams.get("exactWord")?.trim() ?? "";
  const translationId = searchParams.get("translationId") ?? undefined;

  if (!q) {
    return NextResponse.json(
      { error: "Missing q parameter", hits: [], found: 0 },
      { status: 400 },
    );
  }

  try {
    const exactSearch = await runVerseSearch({
      q,
      mode,
      language,
      translationId,
      testament,
      bookSlug,
      chapter: Number.isFinite(chapter) ? chapter : undefined,
      verse: Number.isFinite(verse) ? verse : undefined,
    });

    const approximateSearch = await runApproximateVerseSearch({
      q,
      language,
      translationId,
      testament,
      bookSlug,
      chapter: Number.isFinite(chapter) ? chapter : undefined,
      verse: Number.isFinite(verse) ? verse : undefined,
    });

    const exactKeys = new Set(
      exactSearch.hits.map(
        (hit) => `${hit.translationId}:${hit.bookId}:${hit.chapterNumber}:${hit.verseNumber}`,
      ),
    );
    const approximateHits = approximateSearch.hits.filter(
      (hit) =>
        !exactKeys.has(
          `${hit.translationId}:${hit.bookId}:${hit.chapterNumber}:${hit.verseNumber}`,
        ),
    );
    const hits = [...exactSearch.hits, ...approximateHits].slice(0, 35);
    const found = exactSearch.found + approximateHits.length;

    const normQ = normalizeText(q);
    const tokens = tokenizeNormalized(normQ);

    let exactCount: number | null = null;
    if (exactWord) {
      exactCount = await countExactWordOccurrences({
        word: exactWord,
        translationId,
        testament,
        bookSlug,
      });
    } else if (tokens.length === 0) {
      exactCount = null;
    } else if (tokens.length === 1) {
      exactCount = await countExactWordOccurrences({
        word: tokens[0],
        translationId,
        testament,
        bookSlug,
      });
    } else {
      exactCount = await countExactPhraseOccurrences({
        phrase: q,
        translationId,
        testament,
        bookSlug,
      });
    }

    return NextResponse.json({ hits, found, exactCount });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search error";
    return NextResponse.json({ error: message, hits: [], found: 0 }, { status: 503 });
  }
}
