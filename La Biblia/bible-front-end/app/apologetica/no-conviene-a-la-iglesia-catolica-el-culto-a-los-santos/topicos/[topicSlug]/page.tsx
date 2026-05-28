import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SAINTS_GUIDE_PARENT_SLUG,
  iglesiaGuideTopicPages,
} from "@/data/iglesiaGuideTopics";
import { getSaintsGuideTopicContent } from "@/data/saintsGuideTopicContent";
import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";

export function generateStaticParams() {
  return iglesiaGuideTopicPages.map((topic) => ({ topicSlug: topic.slug }));
}

export default async function SaintsGuideTopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = getSaintsGuideTopicContent(topicSlug);
  if (!topic) notFound();

  const html = fixSpanishEncoding(topic.html);

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
        <h1 className="page-title">{fixSpanishEncoding(topic.title)}</h1>
      </header>

      <div className="content-html saints-guide-topic" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
