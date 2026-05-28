import { NextResponse } from "next/server";
import { getStaticChapter } from "@/lib/staticBible";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "es";
  const bookSlug = searchParams.get("bookSlug") || "";
  const chapterNumber = Number(searchParams.get("chapter"));
  const startVerse = Number(searchParams.get("start"));
  const endVerse = Number(searchParams.get("end") || searchParams.get("start"));

  if (
    !bookSlug ||
    !Number.isInteger(chapterNumber) ||
    !Number.isInteger(startVerse) ||
    !Number.isInteger(endVerse)
  ) {
    return NextResponse.json({ error: "Referencia invalida" }, { status: 400 });
  }

  const chapter = await getStaticChapter(language, bookSlug, chapterNumber);
  if (!chapter) return NextResponse.json({ error: "Capitulo no encontrado" }, { status: 404 });

  const low = Math.min(startVerse, endVerse);
  const high = Math.max(startVerse, endVerse);
  const verses = chapter.verses.filter(
    (verse) => verse.verseNumber >= low && verse.verseNumber <= high,
  );

  if (!verses.length) return NextResponse.json({ error: "Versiculo no encontrado" }, { status: 404 });

  return NextResponse.json({
    text: verses.map((verse) => verse.text).join(" "),
  });
}
