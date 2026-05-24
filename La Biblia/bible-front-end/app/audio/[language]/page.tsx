import Link from "next/link";
import { notFound } from "next/navigation";
import { Headphones } from "lucide-react";
import { BibleIndexClient } from "@/components/bible/BibleIndexClient";
import {
  getStaticBooks,
  getStaticTranslation,
  getSupportedStaticLanguages,
} from "@/lib/staticBible";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getSupportedStaticLanguages().map((language) => ({ language }));
}

export default async function AudioLanguageIndexPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const translation = await getStaticTranslation(language);
  if (!translation) notFound();

  const books = await getStaticBooks(language);

  if (!books.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No hay libros estaticos generados. Ejecuta{" "}
        <code className="rounded bg-white px-1">npm run bible:static</code>.
      </div>
    );
  }

  return (
    <div className="scripture-index-page">
      <div className="scripture-index-content">
        <Link href="/" className="scripture-back-link">
          &larr; Inicio
        </Link>

        <header className="scripture-index-heading">
          <div className="audio-index-intro-icon" aria-hidden>
            <Headphones strokeWidth={1.5} />
          </div>
          <h1>La Biblia de Jerusalén en audio</h1>
          <p className="scripture-edition audio-index-lead">
            Referencia a vídeos en YouTube por libro y capítulo. Elige un libro para escuchar.
          </p>
        </header>

        <BibleIndexClient books={books} language={language} variant="audio" />
      </div>
    </div>
  );
}
