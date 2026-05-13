import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BibliaIndexPage() {
  const langs = await prisma.translation.findMany({
    where: { isPublic: true },
    select: { language: true, name: true, abbreviation: true },
    orderBy: { language: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-accent">La Biblia</h1>
      <p className="text-ink-muted">
        Elige un idioma o traducción disponible para ver el índice de libros.
      </p>
      {langs.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No hay traducciones en la base de datos. Arranca PostgreSQL, ejecuta migraciones Prisma y
          luego <code className="rounded bg-white px-1">npm run import:bible</code>.
        </div>
      ) : (
        <ul className="space-y-2">
          {langs.map((l) => (
            <li key={l.language}>
              <Link
                href={`/biblia/${l.language}`}
                className="text-accent underline-offset-2 hover:underline"
              >
                {l.name} ({l.abbreviation})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
