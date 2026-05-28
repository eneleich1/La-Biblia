import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";
import {
  estudiosPageDescription,
  studyCollections,
  studyFocusItems,
  studyStats,
  type StudyCollection,
} from "@/data/estudiosContent";

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof BookMarked;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.75} aria-hidden />
      <h2 className="shrink-0 font-serif-display text-xl font-semibold text-[var(--text)] sm:text-[1.35rem]">
        {title}
      </h2>
      <div className="h-px min-w-0 flex-1 bg-[var(--border)]" aria-hidden />
    </div>
  );
}

function StatsCard() {
  const items = [
    { label: "colecciones", value: studyStats.collections, icon: BookOpen },
    { label: "disponible", value: studyStats.available, icon: Check },
    { label: "próximamente", value: studyStats.comingSoon, icon: Clock },
  ] as const;

  return (
    <div className="flex shrink-0 divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-1 py-4 shadow-[var(--shadow-card)] sm:min-w-[17.5rem]">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex min-w-[5.5rem] flex-1 flex-col items-center gap-1 px-4 text-center sm:min-w-[6rem]"
        >
          <Icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
          <span className="font-serif-display text-2xl font-semibold leading-none text-[var(--text)]">
            {value}
          </span>
          <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: StudyCollection["status"] }) {
  if (status === "available") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
        Disponible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
      Próximamente
    </span>
  );
}

function CollectionCard({ collection }: { collection: StudyCollection }) {
  const Icon = collection.icon;
  const isAvailable = collection.status === "available";

  const cardInner = (
    <>
      <div
        className={`flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center rounded-full sm:h-[5.25rem] sm:w-[5.25rem] ${
          isAvailable
            ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/20"
            : "bg-[var(--background-soft)] ring-1 ring-[var(--border)]"
        }`}
      >
        <Icon
          className={`h-9 w-9 sm:h-10 sm:w-10 ${isAvailable ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <div className="flex min-h-[5.25rem] min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-serif-display text-lg font-semibold leading-snug text-[var(--text)] sm:text-xl">
            {collection.title}
          </h3>
          {isAvailable ? <StatusBadge status={collection.status} /> : null}
        </div>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
          {collection.description}
        </p>
        {isAvailable && collection.href ? (
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition group-hover:gap-1.5">
            Explorar colección
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        ) : (
          <div className="mt-3 flex justify-end">
            <StatusBadge status={collection.status} />
          </div>
        )}
      </div>
    </>
  );

  const cardClass = `group flex gap-4 rounded-xl border p-4 shadow-[var(--shadow-card)] transition sm:gap-5 sm:p-5 ${
    isAvailable
      ? "border-[var(--accent)]/35 bg-[var(--surface-muted)] hover:border-[var(--accent)]/55 hover:shadow-[var(--shadow-card-hover)]"
      : "border-[var(--border)] bg-[var(--surface)]"
  }`;

  if (isAvailable && collection.href) {
    return (
      <Link href={collection.href} className={`${cardClass} no-underline`}>
        {cardInner}
      </Link>
    );
  }

  return <article className={cardClass}>{cardInner}</article>;
}

function FocusCard({ title, icon: Icon }: { title: string; icon: typeof BookOpen }) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-card)]"
      aria-disabled
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-[var(--text)] sm:text-[15px]">
        {title}
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-[var(--text-muted)] opacity-60"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

export function EstudiosIndex() {
  return (
    <div className="sermons-index-page space-y-10 lg:space-y-12">
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition hover:text-[var(--accent)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="text-[var(--text-muted)]/50">
            /
          </li>
          <li className="font-medium text-[var(--text)]" aria-current="page">
            Estudios
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 max-w-2xl">
          <h1 className="page-title">
            Estudios
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            {estudiosPageDescription}
          </p>
        </div>
        <StatsCard />
      </header>

      <section className="space-y-5" aria-labelledby="colecciones-principales">
        <SectionHeading icon={BookMarked} title="Colecciones principales" />
        <div
          id="colecciones-principales"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {studyCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="explora-enfoque">
        <SectionHeading icon={Compass} title="Explora por enfoque" />
        <div
          id="explora-enfoque"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {studyFocusItems.map((item) => (
            <FocusCard key={item.id} title={item.title} icon={item.icon} />
          ))}
        </div>
      </section>
    </div>
  );
}
