import { NextRequest, NextResponse } from "next/server";
import {
  countExactPhraseOccurrences,
  countExactWordOccurrences,
  runVerseSearch,
} from "@/lib/search";

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
  const exactWord = searchParams.get("exactWord")?.trim() ?? "";
  const translationId = searchParams.get("translationId") ?? undefined;

  if (!q) {
    return NextResponse.json(
      { error: "Missing q parameter", hits: [], found: 0 },
      { status: 400 },
    );
  }

  try {
    const { hits, found } = await runVerseSearch({
      q,
      mode,
      language,
      translationId,
      testament,
      bookSlug,
      chapter: Number.isFinite(chapter) ? chapter : undefined,
    });

    let exactCount: number | null = null;
    if (exactWord) {
      exactCount = await countExactWordOccurrences({
        word: exactWord,
        translationId,
        testament,
        bookSlug,
      });
    } else if (mode === "phrase" && !q.includes(" ")) {
      exactCount = await countExactWordOccurrences({
        word: q,
        translationId,
        testament,
        bookSlug,
      });
    } else if (mode === "phrase") {
      exactCount = await countExactPhraseOccurrences({
        phrase: q,
        translationId,
      });
    }

    return NextResponse.json({ hits, found, exactCount });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search error";
    return NextResponse.json({ error: message, hits: [], found: 0 }, { status: 503 });
  }
}
