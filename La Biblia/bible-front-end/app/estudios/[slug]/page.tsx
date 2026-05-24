import Link from "next/link";
import { notFound } from "next/navigation";
import { BiblicalNotesPage } from "@/components/estudios/notas-biblicas/BiblicalNotesPage";
import { getContentPage, studyPages } from "@/data/seekContent";
import { prisma } from "@/lib/prisma";
import { parseBiblicalNotesHtml } from "@/lib/parseBiblicalNotes";

export const dynamic = "force-dynamic";

export default async function EstudioArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getContentPage(studyPages, slug);
  if (!page) notFound();

  if (slug === "notas-biblicas") {
    const books = await prisma.book.findMany({
      orderBy: [{ testament: "asc" }, { order: "asc" }],
      select: {
        slug: true,
        nameEs: true,
        order: true,
        category: true,
        testament: true,
      },
    });

    const notes = parseBiblicalNotesHtml(page.html);

    return <BiblicalNotesPage notes={notes} books={books} />;
  }

  return (
    <article className="mx-auto max-w-5xl space-y-5">
      <Link href="/estudios" className="text-sm font-semibold text-accent hover:underline">
        Estudios
      </Link>
      <header className="space-y-2">
        <h1 className="page-title">{page.title}</h1>
      </header>
      <div className="content-html" dangerouslySetInnerHTML={{ __html: page.html }} />
    </article>
  );
}
