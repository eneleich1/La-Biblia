import { prisma } from "@/lib/prisma";
import { predicacionesVideosDefaults } from "@/data/predicacionesVideosDefaults";

export type PredicacionVideoRecord = {
  id: string;
  title: string;
  url: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

function toRecord(row: {
  id: string;
  title: string;
  url: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}): PredicacionVideoRecord {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensurePredicacionesVideosSeeded() {
  if (!predicacionesVideosDefaults.length) return;
  const count = await prisma.sermonVideo.count();
  if (count > 0) return;

  await prisma.sermonVideo.createMany({
    data: predicacionesVideosDefaults.map((video, index) => ({
      title: video.title,
      url: video.url,
      position: index,
    })),
  });
}

export async function listPredicacionesVideos() {
  await ensurePredicacionesVideosSeeded();
  const rows = await prisma.sermonVideo.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toRecord);
}

export async function createPredicacionVideo(input: { title: string; url: string }) {
  const max = await prisma.sermonVideo.aggregate({ _max: { position: true } });
  const row = await prisma.sermonVideo.create({
    data: {
      title: input.title.trim(),
      url: input.url.trim(),
      position: (max._max.position ?? -1) + 1,
    },
  });
  return toRecord(row);
}

export async function updatePredicacionVideo(
  id: string,
  input: Partial<{ title: string; url: string }>,
) {
  const row = await prisma.sermonVideo.update({
    where: { id },
    data: {
      title: typeof input.title === "string" ? input.title.trim() : undefined,
      url: typeof input.url === "string" ? input.url.trim() : undefined,
    },
  });
  return toRecord(row);
}

export async function deletePredicacionVideo(id: string) {
  await prisma.sermonVideo.delete({ where: { id } });
}
