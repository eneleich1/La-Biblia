import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export type AudioChapterLink = {
  youtubeVideoId: string;
  startSecond: number | null;
  endSecond: number | null;
};

type StaticAudioManifest = {
  links: Record<string, Record<string, AudioChapterLink>>;
};

const STATIC_AUDIO_ROOT = path.join(process.cwd(), "data", "audio-static");
const staticManifestCache = new Map<string, Promise<StaticAudioManifest | null>>();

async function loadStaticManifest(language: string): Promise<StaticAudioManifest | null> {
  if (!staticManifestCache.has(language)) {
    staticManifestCache.set(
      language,
      (async () => {
        try {
          const text = await readFile(
            path.join(STATIC_AUDIO_ROOT, language, "manifest.json"),
            "utf-8",
          );
          return JSON.parse(text) as StaticAudioManifest;
        } catch {
          return null;
        }
      })(),
    );
  }
  return staticManifestCache.get(language)!;
}

function staticLink(
  manifest: StaticAudioManifest | null,
  bookSlug: string,
  chapterNumber: number,
): AudioChapterLink | null {
  const bookLinks = manifest?.links[bookSlug];
  if (!bookLinks) return null;
  return bookLinks[String(chapterNumber)] ?? null;
}

export async function getAudioChapterLink(
  language: string,
  bookSlug: string,
  chapterNumber: number,
): Promise<AudioChapterLink | null> {
  const manifest = await loadStaticManifest(language);
  const fromStatic = staticLink(manifest, bookSlug, chapterNumber);
  if (fromStatic) return fromStatic;

  try {
    const row = await prisma.audioLink.findFirst({
      where: {
        chapterNumber,
        book: { slug: bookSlug },
        translation: { language },
      },
      select: {
        youtubeVideoId: true,
        startSecond: true,
        endSecond: true,
      },
    });
    if (!row) return null;
    return {
      youtubeVideoId: row.youtubeVideoId,
      startSecond: row.startSecond,
      endSecond: row.endSecond,
    };
  } catch {
    return null;
  }
}

export async function getAudioLinksForBook(
  language: string,
  bookSlug: string,
  chapterNumbers: number[],
): Promise<Record<number, AudioChapterLink>> {
  const manifest = await loadStaticManifest(language);
  const out: Record<number, AudioChapterLink> = {};

  for (const chapterNumber of chapterNumbers) {
    const link = staticLink(manifest, bookSlug, chapterNumber);
    if (link) out[chapterNumber] = link;
  }

  const missing = chapterNumbers.filter((n) => !out[n]);
  if (missing.length === 0) return out;

  try {
    const rows = await prisma.audioLink.findMany({
      where: {
        chapterNumber: { in: missing },
        book: { slug: bookSlug },
        translation: { language },
      },
      select: {
        chapterNumber: true,
        youtubeVideoId: true,
        startSecond: true,
        endSecond: true,
      },
    });
    for (const row of rows) {
      out[row.chapterNumber] = {
        youtubeVideoId: row.youtubeVideoId,
        startSecond: row.startSecond,
        endSecond: row.endSecond,
      };
    }
  } catch {
    // Sin base de datos: solo enlaces estáticos.
  }

  return out;
}
