import Link from "next/link";

const cards = [
  { href: "/lecturas-del-dia", title: "Lecturas del día", desc: "Lecturas litúrgicas (próximamente con datos)." },
  { href: "/biblia", title: "Leer la Biblia", desc: "Jerusalén 1976 en lectura por libros y capítulos." },
  { href: "/audio", title: "Biblia en audio", desc: "Enlaces a audio por capítulo (contenido pendiente)." },
  { href: "/buscar", title: "Buscar en la Biblia", desc: "Búsqueda rápida con Typesense y conteos exactos." },
  { href: "/apologetica", title: "Apologética", desc: "Artículos de defensa de la fe (estructura lista)." },
  { href: "/predicaciones", title: "Predicaciones", desc: "Sermones y enseñanzas (estructura lista)." },
  { href: "/estudios", title: "Estudios", desc: "Estudios bíblicos guiados (estructura lista)." },
  { href: "/debates", title: "Debates", desc: "Debates y diálogos (estructura lista)." },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-accent-soft bg-white/80 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-ink-muted">Plataforma</p>
        <h1 className="mt-2 text-3xl font-semibold text-accent">
          Plataforma bíblica cristiana
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Un solo lugar para leer la Biblia de Jerusalén, buscar pasajes, preparar estudios y
          conectar con recursos de crecimiento espiritual. Esta versión inicial incluye lector,
          búsqueda y cimientos técnicos (PostgreSQL, Prisma, Typesense).
        </p>
      </section>

      <section className="rounded-2xl border border-accent-soft bg-paper-alt p-6">
        <h2 className="text-lg font-semibold text-ink">Versículo al azar</h2>
        <p className="mt-2 text-ink-muted">
          Placeholder: en una siguiente iteración se podrá tomar un versículo aleatorio desde la
          base de datos.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Explorar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-xl border border-accent-soft bg-white p-5 shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <h3 className="font-semibold text-accent">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
