export default function AudioIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-accent">Biblia en audio</h1>
      <p className="text-ink-muted">
        Placeholder: aquí enlazarás reproductores o enlaces externos por idioma y capítulo. Rutas anidadas:
        <code className="mx-1 rounded bg-paper-alt px-1">/audio/[language]/[bookSlug]/[chapter]</code>
      </p>
    </div>
  );
}
