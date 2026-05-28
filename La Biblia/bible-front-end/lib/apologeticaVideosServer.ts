import { prisma } from "@/lib/prisma";
import { apologeticaVideosDefaults } from "@/data/apologeticaVideosDefaults";

export type ApologeticaVideoRecord = {
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
}): ApologeticaVideoRecord {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureApologeticaVideosSeeded() {
  const count = await prisma.apologeticaVideo.count();
  if (count > 0) return;

  await prisma.apologeticaVideo.createMany({
    data: apologeticaVideosDefaults.map((video, index) => ({
      title: video.title,
      url: video.url,
      position: index,
    })),
  });
}

export async function listApologeticaVideos() {
  await ensureApologeticaVideosSeeded();
  const rows = await prisma.apologeticaVideo.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toRecord);
}

export async function createApologeticaVideo(input: { title: string; url: string }) {
  const max = await prisma.apologeticaVideo.aggregate({ _max: { position: true } });
  const row = await prisma.apologeticaVideo.create({
    data: {
      title: input.title.trim(),
      url: input.url.trim(),
      position: (max._max.position ?? -1) + 1,
    },
  });
  return toRecord(row);
}

export async function updateApologeticaVideo(
  id: string,
  input: Partial<{ title: string; url: string }>,
) {
  const row = await prisma.apologeticaVideo.update({
    where: { id },
    data: {
      title: typeof input.title === "string" ? input.title.trim() : undefined,
      url: typeof input.url === "string" ? input.url.trim() : undefined,
    },
  });
  return toRecord(row);
}

export async function deleteApologeticaVideo(id: string) {
  await prisma.apologeticaVideo.delete({ where: { id } });
}
