import Link from "next/link";
import { ApologeticaGuidePage } from "@/components/apologetica/ApologeticaGuidePage";
import { getApologeticaGuidePage } from "@/data/apologeticaGuidePages";
import {
  apologeticsArticles,
  getContentPage,
  getForumPage,
} from "@/data/seekContent";
import { StoredPageClient } from "@/components/site/StoredPageClient";
import { StoredPageView } from "@/components/site/StoredPageView";
import { isAdminServer } from "@/lib/adminSessionServer";
import { getSitePageByRoute } from "@/lib/sitePagesServer";
import { formatBibleBookTitle } from "@/lib/formatTitle";
import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";
import { getStaticBook, getStaticBooks } from "@/lib/staticBible";

export default async function ApologeticaArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getApologeticaGuidePage(slug);
  const page = getContentPage(apologeticsArticles, slug);
  const forum = getForumPage(slug);

  if (guide) {
    const books = await getStaticBooks("es");
    const bibleBooks = await Promise.all(
      books.map(async (book) => {
        const fullBook = await getStaticBook("es", book.slug);
        return {
          slug: book.slug,
          title: formatBibleBookTitle(fixSpanishEncoding(book.nameEs), book.slug),
          testament: book.testament,
          chapters: fullBook.chapters.map((chapter) => ({
            number: chapter.number,
            verseCount: chapter.verses.length,
          })),
        };
      }),
    );

    return <ApologeticaGuidePage guide={guide} bibleBooks={bibleBooks} />;
  }

  if (!page && !forum) {
    const admin = await isAdminServer();
    let sitePage = null;
    try {
      sitePage = await getSitePageByRoute(`/apologetica/${slug}`, admin);
    } catch {
      sitePage = null;
    }
    if (sitePage) {
      return <StoredPageView page={sitePage} canEdit={admin} />;
    }
    return <StoredPageClient route={`/apologetica/${slug}`} />;
  }

  return (
    <article className="mx-auto max-w-5xl space-y-5">
      <Link href="/apologetica" className="text-sm font-semibold text-accent hover:underline">
        Apologética
      </Link>

      {page ? (
        <>
          <h1 className="page-title">{page.title}</h1>
          <div className="content-html" dangerouslySetInnerHTML={{ __html: page.html }} />
        </>
      ) : null}

      {forum ? (
        <>
          <h1 className="page-title">{forum.title}</h1>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">Tópicos</h2>
            <ul className="space-y-3">
              {forum.topics.map((topic) => (
                <li key={topic.sourceUrl} className="rounded-lg border border-accent-soft bg-white p-4">
                  <a
                    href={topic.sourceUrl}
                    className="font-semibold text-accent hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {topic.title}
                  </a>
                  <p className="mt-2 text-sm text-ink-muted">
                    El HTML descargado de WordPress contiene este tópico en el índice del foro, pero no
                    incluye el cuerpo del tópico.
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </article>
  );
}
