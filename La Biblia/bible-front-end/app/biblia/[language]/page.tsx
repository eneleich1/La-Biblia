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
      title: formatBookTitleWithRomanAfterDash(b.nameEs.toLowerCase()),
      order: b.order,
    });
  }

  return {
    ot: [...otMap.values()],
    nt: [...ntMap.values()],
  };
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
    <div className="space-y-8">
      <div>
        <Link href="/biblia" className="text-sm text-ink-muted hover:text-accent">
          ← Traducciones
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-accent">{translation.name}</h1>
        <p className="text-ink-muted">{translation.abbreviation}</p>
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr]">
        <section>
          <h2 className="mb-4 text-center text-lg font-semibold">Antiguo Testamento</h2>
          <div className="space-y-6">
            {ot.map((g) => (
              <div key={g.title}>
                <h3 className="font-medium text-ink">{g.title}</h3>
                <ul className="mt-2 list-none space-y-1 ps-0">
                  {[...g.books].sort((a, b) => a.order - b.order).map((b) => (
                    <li key={b.slug}>
                      <Link
                        href={`/biblia/${language}/${b.slug}`}
                        className="text-accent hover:underline"
                      >
                        {b.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="hidden md:block w-px bg-accent-soft self-stretch" />

        <section>
          <h2 className="mb-4 text-center text-lg font-semibold">Nuevo Testamento</h2>
          <div className="space-y-6">
            {nt.map((g) => (
              <div key={g.title}>
                <h3 className="font-medium text-ink">{g.title}</h3>
                <ul className="mt-2 list-none space-y-1">
                  {[...g.books].sort((a, b) => a.order - b.order).map((b) => (
                    <li key={b.slug}>
                      <Link
                        href={`/biblia/${language}/${b.slug}`}
                        className="text-accent hover:underline"
                      >
                        {b.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
