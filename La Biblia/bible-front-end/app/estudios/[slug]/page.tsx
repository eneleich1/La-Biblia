export default async function EstudioArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-accent">Estudio: {slug}</h1>
      <p className="text-ink-muted">Placeholder de detalle de artículo.</p>
    </div>
  );
}
