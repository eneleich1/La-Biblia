import Link from "next/link";
import { sermonPages } from "@/data/sermons";

export default function PredicacionesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="page-title">Predicaciones</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sermonPages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/predicaciones/${page.slug}`}
              className="block rounded-lg border border-accent-soft bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-card)]"
            >
              <span className="block font-semibold text-accent">{page.title}</span>
              <span className="mt-2 block text-sm text-[var(--text-muted)]">{page.reference}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
