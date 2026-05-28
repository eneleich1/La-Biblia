import Link from "next/link";
import { Clock3 } from "lucide-react";

export default function HistoriaIglesiaPage() {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-5 pb-8">
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition hover:text-[var(--accent)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li>
            <Link href="/apologetica" className="transition hover:text-[var(--accent)]">
              Apologética
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li aria-current="page">Historia de la Iglesia</li>
        </ol>
      </nav>

      <header className="space-y-2">
        <h1 className="page-title">Historia de la Iglesia</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Sección en preparación para próximos estudios históricos de la Iglesia.
        </p>
      </header>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-8 text-center shadow-[var(--shadow-card)]">
        <Clock3 className="mx-auto h-8 w-8 text-[var(--accent)]" strokeWidth={1.7} aria-hidden />
        <p className="mt-3 font-serif-display text-xl font-semibold text-[var(--text)]">Próximamente</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Estamos preparando este contenido.
        </p>
      </section>
    </article>
  );
}
