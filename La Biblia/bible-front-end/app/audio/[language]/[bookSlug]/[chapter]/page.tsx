export default async function AudioChapterPage({
  params,
}: {
  params: Promise<{ language: string; bookSlug: string; chapter: string }>;
}) {
  const { language, bookSlug, chapter } = await params;
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-accent">Audio · placeholder</h1>
      <p className="text-ink-muted">
        {language} / {bookSlug} / capítulo {chapter}
      </p>
      <p className="text-sm text-ink-muted">
        Modelo <code className="rounded bg-paper-alt px-1">AudioLink</code> en Prisma listo para enlazar
        vídeos de YouTube por capítulo.
      </p>
    </div>
  );
}
