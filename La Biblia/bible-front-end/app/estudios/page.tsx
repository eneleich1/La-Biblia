import Link from "next/link";

export default function EstudiosIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-accent">Estudios</h1>
      <p className="text-ink-muted">Artículos de tipo estudio (modelo Article).</p>
      <Link href="/estudios/ejemplo" className="text-accent underline">
        Artículo de ejemplo
      </Link>
    </div>
  );
}
