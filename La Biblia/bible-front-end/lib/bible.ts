import { prisma } from "@/lib/prisma";

export async function getTranslationByLanguage(language: string) {
  return prisma.translation.findFirst({
    where: { language, isPublic: true },
  });
}

export async function getBookBySlug(slug: string) {
  return prisma.book.findUnique({ where: { slug } });
}

export async function getTestamentBookCounts() {
  const [ot, nt] = await Promise.all([
    prisma.book.aggregate({ where: { testament: 1 }, _max: { order: true } }),
    prisma.book.aggregate({ where: { testament: 2 }, _max: { order: true } }),
  ]);
  return {
    otLast: ot._max.order ?? 46,
    ntLast: nt._max.order ?? 27,
  };
}

export async function getAdjacentBooks(
  testament: number,
  order: number,
  otLastOrder: number,
  ntLastOrder: number,
) {
  let prevSlug: string | null = null;
  let nextSlug: string | null = null;

  if (testament === 1 && order === 1) {
    prevSlug = null;
  } else if (testament === 2 && order === 1) {
    const b = await prisma.book.findFirst({
      where: { testament: 1, order: otLastOrder },
      select: { slug: true },
    });
    prevSlug = b?.slug ?? null;
  } else {
    const b = await prisma.book.findFirst({
      where: { testament, order: order - 1 },
      select: { slug: true },
    });
    prevSlug = b?.slug ?? null;
  }

  if (testament === 2 && order === ntLastOrder) {
    nextSlug = null;
  } else if (testament === 1 && order === otLastOrder) {
    const b = await prisma.book.findFirst({
      where: { testament: 2, order: 1 },
      select: { slug: true },
    });
    nextSlug = b?.slug ?? null;
  } else {
    const b = await prisma.book.findFirst({
      where: { testament, order: order + 1 },
      select: { slug: true },
    });
    nextSlug = b?.slug ?? null;
  }

  return { prevSlug, nextSlug };
}
