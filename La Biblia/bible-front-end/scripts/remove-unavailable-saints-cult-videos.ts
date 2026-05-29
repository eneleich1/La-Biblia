/**
 * Elimina videos de YouTube no disponibles y la sección vacía santos-no-milagros.
 * Uso: npx tsx scripts/remove-unavailable-saints-cult-videos.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const URLS_TO_REMOVE = [
  "https://www.youtube.com/watch?v=g_IqpTDTccc",
  "https://www.youtube.com/watch?v=RLHbkz1w7Ko",
];

async function main() {
  const deletedByUrl = await prisma.saintsCultExampleVideo.deleteMany({
    where: { url: { in: URLS_TO_REMOVE } },
  });

  const deletedTopic = await prisma.saintsCultExampleVideo.deleteMany({
    where: { topicId: "santos-no-milagros" },
  });

  console.log(`Videos por URL eliminados: ${deletedByUrl.count}`);
  console.log(`Videos del tema santos-no-milagros eliminados: ${deletedTopic.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
