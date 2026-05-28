import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SAINTS_GUIDE_PARENT_SLUG,
  getIglesiaGuideTopicPage,
  iglesiaGuideTopicPages,
} from "@/data/iglesiaGuideTopics";

export function generateStaticParams() {
  return iglesiaGuideTopicPages.map((topic) => ({ topicSlug: topic.slug }));
}

export default async function SaintsGuideTopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = getIglesiaGuideTopicPage(topicSlug);
  if (!topic) notFound();

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
              Apologetica
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li>
            <Link
              href={`/apologetica/${SAINTS_GUIDE_PARENT_SLUG}`}
              className="transition hover:text-[var(--accent)]"
            >
              Guia madre
            </Link>
          </li>
        </ol>
      </nav>

      <Link
        href={`/apologetica/${SAINTS_GUIDE_PARENT_SLUG}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition hover:underline"
      >
        Volver a la guia principal
      </Link>

      <header className="space-y-2">
        <h1 className="page-title">{topic.title}</h1>
        <p className="text-base leading-relaxed text-[var(--text-muted)]">{topic.summary}</p>
      </header>

      <section className="space-y-4">
        {topic.sections.map((section) => (
          <div
            key={section.heading}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]"
          >
            <h2 className="font-serif-display text-xl font-semibold text-[var(--text)]">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{section.body}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
