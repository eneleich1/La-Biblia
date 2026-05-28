import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const count = await prisma.sitePage.count();
  const pages = await prisma.sitePage.findMany({
    select: { id: true, route: true, title: true, status: true },
    orderBy: { updatedAt: "desc" },
  });
  console.log("SitePage count:", count);
  console.log(JSON.stringify(pages, null, 2));
} finally {
  await prisma.$disconnect();
}
