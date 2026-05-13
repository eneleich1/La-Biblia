import { BibleSearchClient } from "@/components/search/BibleSearchClient";

export default function BuscarPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-accent">Buscar en la Biblia</h1>
      <p className="text-ink-muted">
        Búsqueda de texto con Typesense; el conteo exacto de palabras usa la tabla{" "}
        <code className="rounded bg-paper-alt px-1">VerseWord</code> en PostgreSQL (tras{" "}
        <code className="rounded bg-paper-alt px-1">npm run verse-words</code>).
      </p>
      <BibleSearchClient />
    </div>
  );
}
