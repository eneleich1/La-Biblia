/**
 * Obtiene títulos reales de YouTube (oEmbed) y actualiza SaintsCultExampleVideo en BD.
 * Uso: npx tsx scripts/sync-saints-cult-youtube-titles.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchYouTubeTitle(url: string): Promise<string> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(endpoint, {
    headers: { "User-Agent": "SeekOfTruth/1.0 (title sync)" },
  });
  if (!response.ok) {
    throw new Error(`oEmbed ${response.status} para ${url}`);
  }
  const data = (await response.json()) as { title?: string };
  if (!data.title?.trim()) {
    throw new Error(`Sin título en oEmbed para ${url}`);
  }
  return data.title.trim();
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const videos = await prisma.saintsCultExampleVideo.findMany({
    orderBy: [{ topicId: "asc" }, { position: "asc" }],
  });

  if (!videos.length) {
    console.log("No hay videos en la base de datos. Ejecuta la app una vez para el seed.");
    return;
  }

  console.log(`Sincronizando ${videos.length} títulos desde YouTube...\n`);

  let updated = 0;
  let failed = 0;

  for (const video of videos) {
    try {
      const title = await fetchYouTubeTitle(video.url);
      if (title === video.title) {
        console.log(`= ${video.id.slice(0, 8)}… sin cambios: ${title}`);
      } else {
        await prisma.saintsCultExampleVideo.update({
          where: { id: video.id },
          data: { title },
        });
        console.log(`✓ ${video.id.slice(0, 8)}…`);
        console.log(`  antes: ${video.title}`);
        console.log(`  ahora: ${title}\n`);
        updated += 1;
      }
      await delay(350);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${video.url}`);
      console.error(`  ${error instanceof Error ? error.message : error}\n`);
    }
  }

  console.log(`Listo: ${updated} actualizados, ${failed} errores, ${videos.length - updated - failed} sin cambios.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
