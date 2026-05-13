export default async function DebatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-accent">Debate: {slug}</h1>
      <p className="text-ink-muted">Placeholder (modelo Debate).</p>
    </div>
  );
}
