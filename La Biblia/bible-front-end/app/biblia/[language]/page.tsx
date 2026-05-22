import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BibleIndexClient } from "@/components/bible/BibleIndexClient";

export const dynamic = "force-dynamic";

export default async function BibliaLanguagePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const translation = await prisma.translation.findFirst({
    where: { language, isPublic: true },
  });
  if (!translation) notFound();

  const books = await prisma.book.findMany({
    orderBy: [{ testament: "asc" }, { order: "asc" }],
  });

  if (!books.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No hay libros importados. Ejecuta <code className="rounded bg-white px-1">npm run import:bible</code>.
      </div>
    );
  }

  return (
    <div className="scripture-index-page">
      <div className="scripture-index-content">
        <Link href="/biblia" className="scripture-back-link">
          ← Traducciones
        </Link>

        <header className="scripture-index-heading">
          <h1>{translation.name}</h1>
          <p className="scripture-edition">Edición de 1976</p>
        </header>

        <BibleIndexClient books={books} language={language} />
      </div>
    </div>
  );
}
