import { prisma } from "@/lib/prisma";
import { isSaintsCultTopicId, saintsCultVideosDefaults } from "@/data/saintsCultVideosDefaults";

export type SaintsCultVideoRecord = {
  id: string;
  topicId: string;
  title: string;
  url: string;
  tag: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

function toRecord(row: {
  id: string;
  topicId: string;
  title: string;
  url: string;
  tag: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}): SaintsCultVideoRecord {
  return {
    id: row.id,
    topicId: row.topicId,
    title: row.title,
    url: row.url,
    tag: row.tag,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureSaintsCultVideosSeeded() {
  const count = await prisma.saintsCultExampleVideo.count();
  if (count > 0) return;

  const positionByTopic = new Map<string, number>();
  const data = saintsCultVideosDefaults.map((video) => {
    const position = positionByTopic.get(video.topicId) ?? 0;
    positionByTopic.set(video.topicId, position + 1);
    return {
      topicId: video.topicId,
      title: video.title,
      url: video.url,
      tag: video.tag ?? null,
      position,
    };
  });

  await prisma.saintsCultExampleVideo.createMany({ data });
}

export async function listSaintsCultVideos() {
  await ensureSaintsCultVideosSeeded();
  const rows = await prisma.saintsCultExampleVideo.findMany({
    orderBy: [{ topicId: "asc" }, { position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toRecord);
}

export async function createSaintsCultVideo(input: {
  topicId: string;
  title: string;
  url: string;
  tag?: string | null;
}) {
  if (!isSaintsCultTopicId(input.topicId)) {
    throw new Error("Tema no válido.");
  }

  const max = await prisma.saintsCultExampleVideo.aggregate({
    where: { topicId: input.topicId },
    _max: { position: true },
  });

  const row = await prisma.saintsCultExampleVideo.create({
    data: {
      topicId: input.topicId,
      title: input.title.trim(),
      url: input.url.trim(),
      tag: input.tag?.trim() || null,
      position: (max._max.position ?? -1) + 1,
    },
  });
  return toRecord(row);
}

export function isFallbackSaintsCultVideoId(id: string) {
  return id.startsWith("fallback-");
}

/** Convierte ids temporales del modo fallback al id real en BD (tras seed). */
export async function resolveSaintsCultVideoId(
  id: string,
  hint?: { url?: string; topicId?: string },
): Promise<string> {
  if (!isFallbackSaintsCultVideoId(id)) return id;

  await ensureSaintsCultVideosSeeded();
  const videos = await listSaintsCultVideos();

  const url = hint?.url?.trim();
  if (url) {
    const byUrl = videos.find((video) => video.url === url);
    if (byUrl) return byUrl.id;
  }

  const index = Number(id.replace("fallback-", ""));
  const defaultEntry = saintsCultVideosDefaults[index];
  if (defaultEntry) {
    const byDefault = videos.find(
      (video) => video.topicId === defaultEntry.topicId && video.url === defaultEntry.url,
    );
    if (byDefault) return byDefault.id;
  }

  throw new Error("Recarga la página para sincronizar los videos con la base de datos.");
}

export async function updateSaintsCultVideo(
  id: string,
  input: Partial<{ topicId: string; title: string; url: string; tag: string | null }>,
) {
  if (input.topicId != null && !isSaintsCultTopicId(input.topicId)) {
    throw new Error("Tema no válido.");
  }

  const resolvedId = await resolveSaintsCultVideoId(id, {
    url: typeof input.url === "string" ? input.url : undefined,
    topicId: input.topicId,
  });

  const row = await prisma.saintsCultExampleVideo.update({
    where: { id: resolvedId },
    data: {
      topicId: input.topicId,
      title: typeof input.title === "string" ? input.title.trim() : undefined,
      url: typeof input.url === "string" ? input.url.trim() : undefined,
      tag:
        input.tag === undefined
          ? undefined
          : input.tag === null
            ? null
            : input.tag.trim() || null,
    },
  });
  return toRecord(row);
}

export async function deleteSaintsCultVideo(id: string, hint?: { url?: string }) {
  const resolvedId = await resolveSaintsCultVideoId(id, hint);
  await prisma.saintsCultExampleVideo.delete({ where: { id: resolvedId } });
}

export function saintsCultVideosFallback(): SaintsCultVideoRecord[] {
  const positionByTopic = new Map<string, number>();
  return saintsCultVideosDefaults.map((video, index) => {
    const position = positionByTopic.get(video.topicId) ?? 0;
    positionByTopic.set(video.topicId, position + 1);
    return {
      id: `fallback-${index}`,
      topicId: video.topicId,
      title: video.title,
      url: video.url,
      tag: video.tag ?? null,
      position,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    };
  });
}
