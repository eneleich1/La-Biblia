import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBookTitleWithRomanAfterDash } from "@/lib/formatTitle";

export const dynamic = "force-dynamic";

type Group = { title: string; books: { slug: string; title: string; order: number }[] };

function buildGroups(
  books: {
    slug: string;
    nameEs: string;
    category: string | null;
    testament: number;
    order: number;
  }[],
): { ot: Group[]; nt: Group[] } {
  const otMap = new Map<string, Group>();
  const ntMap = new Map<string, Group>();

  for (const b of books) {
    const map = b.testament === 1 ? otMap : ntMap;
    const key = b.category ?? (b.testament === 1 ? "Antiguo Testamento" : "Nuevo Testamento");
    if (!map.has(key)) map.set(key, { title: key, books: [] });
    map.get(key)!.books.push({
      slug: b.slug,
      title: formatBookTitleWithRomanAfterDash(b.nameEs),
      order: b.order,
    });
  }

  return {
    ot: [...otMap.values()],
    nt: [...ntMap.values()],
  };
}

function TestamentPage({
  title,
  groups,
  language,
}: {
  title: string;
  groups: Group[];
  language: string;
}) {
  return (
    <section className="scripture-book-page">
      <div className="scripture-flourish" aria-hidden>
        <span />
      </div>
      <h2 className="scripture-testament-title">{title}</h2>
      <div className="scripture-title-rule" aria-hidden />
      <div className="scripture-group-stack">
        {groups.map((g) => (
          <div key={g.title} className="scripture-index-group">
            <h3>{formatBookTitleWithRomanAfterDash(g.title)}</h3>
            <ul>
              {[...g.books].sort((a, b) => a.order - b.order).map((b) => (
                <li key={b.slug}>
                  <Link href={`/biblia/${language}/${b.slug}`}>
                    <span className="scripture-book-number">
                      {String(b.order).padStart(2, "0")}.
                    </span>
                    <span>{b.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function BibliaLanguagePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const translation = await prisma.translation.findFirst({
    where: { language, isPublic: true },
  });
  if (!translation) notFound();

  const books = await prisma.book.findMany({
    orderBy: [{ testament: "asc" }, { order: "asc" }],
  });

  if (!books.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No hay libros importados. Ejecuta <code className="rounded bg-white px-1">npm run import:bible</code>.
      </div>
    );
  }

  const { ot, nt } = buildGroups(books);

  return (
    <div className="scripture-index-page">
      <div className="scripture-index-content">
        <Link href="/biblia" className="scripture-back-link">
          ← Traducciones
        </Link>

        <header className="scripture-index-heading">
          <h1>{translation.name}</h1>
          <p className="scripture-edition">Edición de 1976</p>
        </header>

        <div className="scripture-open-book scripture-open-book-index">
          <TestamentPage title="Antiguo Testamento" groups={ot} language={language} />
          <TestamentPage title="Nuevo Testamento" groups={nt} language={language} />
        </div>
      </div>
    </div>
  );
}
