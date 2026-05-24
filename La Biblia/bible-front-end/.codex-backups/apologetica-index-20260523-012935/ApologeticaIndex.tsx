"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronRight,
  Church,
  Clock,
  Home,
  MessagesSquare,
  Play,
  Shield,
} from "lucide-react";
import {
  apologeticaGuides,
  apologeticaHeroQuote,
  apologeticaMoreResources,
  apologeticaPageDescription,
  apologeticaStats,
  apologeticaTabs,
  apologeticsForums,
  apologeticsVideoLinks,
  type ApologeticaGuide,
  type ApologeticaResource,
  type ApologeticaTab,
} from "@/data/apologeticaContent";

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-0.5 w-8 shrink-0 bg-[var(--accent)]" aria-hidden />
      <h2 className="font-serif-display text-xl font-semibold text-[var(--text)] sm:text-[1.35rem]">
        {children}
      </h2>
    </div>
  );
}

/** Ilustración de respaldo si aún no hay asset final */
function HeroIllustrationFallback() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <div className="flex h-[5.5rem] w-[4.75rem] flex-col items-center justify-end rounded-xl border border-[var(--border)] bg-white px-2 pb-2 shadow-sm">
        <BookOpen className="h-10 w-10 text-[var(--accent)]" strokeWidth={1.35} />
        <div className="mt-1.5 h-1 w-full rounded-full bg-[var(--accent)]/15" />
        <div className="mt-0.5 h-1 w-4/5 rounded-full bg-[var(--accent)]/10" />
      </div>
      <div className="flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-full border border-[var(--border)] bg-white shadow-sm">
        <Shield className="h-11 w-11 text-[var(--accent)]" strokeWidth={1.35} />
      </div>
    </div>
  );
}

function HeroFeatureCard() {
  const statItems = [
    { icon: BookOpen, value: apologeticaStats.guides, label: "Guías disponibles" },
    { icon: MessagesSquare, value: apologeticaStats.debates, label: "Debates y respuestas" },
    { icon: Play, value: apologeticaStats.videos, label: "Videos apologéticos" },
    {
      icon: Church,
      value: null,
      label: "Más recursos",
      prefix: "Próximamente",
      muted: true,
    },
  ] as const;

  return (
    <div className="min-w-0 w-full flex-1 rounded-xl border border-[var(--border)] bg-[#f5efe6] shadow-[var(--shadow-card)]">
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(9.5rem,11rem)] lg:items-center lg:gap-5 lg:p-6">
        <blockquote className="relative min-w-0">
          <span
            className="pointer-events-none font-serif-display text-[3.25rem] leading-none text-[var(--accent)]/35 sm:text-[3.75rem]"
            aria-hidden
          >
            “
          </span>
          <p className="-mt-3 font-serif-display text-[14px] italic leading-[1.6] text-[var(--text)] sm:text-[15px]">
            {apologeticaHeroQuote.text}
          </p>
          <footer className="mt-2 text-xs font-medium text-[var(--text-muted)] sm:text-sm">
            — {apologeticaHeroQuote.reference}
          </footer>
        </blockquote>

        <div className="relative flex min-h-[5.5rem] items-center justify-center py-1 lg:min-h-0 lg:py-0">
          <HeroIllustrationFallback />
          {/* Sustituye el fallback: coloca hero-feature.webp y descomenta */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* <img src="/apologetica/hero-feature.webp" alt="" className="absolute inset-0 m-auto h-auto max-h-full max-w-[240px] object-contain" /> */}
        </div>

        <ul className="flex flex-col gap-3 border-t border-[var(--border)]/60 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          {statItems.map(({ icon: Icon, value, label, ...rest }) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--accent)]">
                <Icon className="h-4 w-4" strokeWidth={1.65} aria-hidden />
              </span>
              <p
                className={`text-sm leading-snug ${
                  "muted" in rest && rest.muted
                    ? "text-[var(--text-muted)]"
                    : "text-[var(--text)]"
                }`}
              >
                {"prefix" in rest && rest.prefix ? (
                  <>
                    <span className="font-semibold">{rest.prefix}</span> {label}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{value}</span> {label}
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: ApologeticaTab;
  onChange: (tab: ApologeticaTab) => void;
}) {
  return (
    <div className="w-full border-b border-[var(--border)]">
      <div
        className="flex flex-wrap gap-1.5 pb-2"
        role="tablist"
        aria-label="Secciones de apologética"
      >
        {apologeticaTabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={`inline-flex items-center gap-2 rounded-none border px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5 ${
                isActive
                  ? "border-[var(--accent)]/45 bg-[#f5efe6] text-[var(--text)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/25 hover:text-[var(--text)]"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--accent)]" : ""}`}
                strokeWidth={1.75}
                aria-hidden
              />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GuideIcon({ guide }: { guide: ApologeticaGuide }) {
  const sizeClass = "h-[4.75rem] w-[4.75rem] shrink-0 sm:h-[5.25rem] sm:w-[5.25rem]";

  if (guide.iconSrc) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5efe6] ${sizeClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={guide.iconSrc}
          alt={guide.iconAlt ?? guide.title}
          width={80}
          height={80}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  const Icon = guide.icon ?? BookOpen;
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#f5efe6] ring-1 ring-[var(--accent)]/15 ${sizeClass}`}
    >
      <Icon className="h-9 w-9 text-[var(--accent)] sm:h-10 sm:w-10" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

function GuideCard({ guide }: { guide: ApologeticaGuide }) {
  return (
    <Link
      href={`/apologetica/${guide.slug}`}
      className="group relative flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-card-hover)] no-underline sm:gap-5"
    >
      <Bookmark
        className="absolute right-4 top-4 h-4 w-4 text-[var(--accent)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <GuideIcon guide={guide} />
      <div className="min-w-0 flex-1 pr-5">
        <h3 className="font-serif-display text-lg font-semibold leading-snug text-[var(--text)] sm:text-xl">
          {guide.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
          {guide.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-[var(--accent)] transition group-hover:gap-1">
          Abrir guía
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function ResourceCard({ resource }: { resource: ApologeticaResource }) {
  const Icon = resource.icon;
  return (
    <article className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5efe6] text-[var(--accent)]">
        <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
      </span>
      <h3 className="mt-4 font-serif-display text-base font-semibold leading-snug text-[var(--text)]">
        {resource.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
        {resource.description}
      </p>
      <span className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        Próximamente
      </span>
    </article>
  );
}

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-6 py-12 text-center">
      <Clock className="mx-auto h-8 w-8 text-[var(--accent)]" strokeWidth={1.5} aria-hidden />
      <p className="mt-4 font-serif-display text-lg font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Esta sección estará disponible próximamente.
      </p>
    </div>
  );
}

function DebatesPanel() {
  if (!apologeticsForums.length) {
    return <ComingSoonPanel title="Debates y respuestas" />;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {apologeticsForums.map((forum) => (
        <li key={forum.slug}>
          <Link
            href={`/apologetica/${forum.slug}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 no-underline"
          >
            <div className="min-w-0">
              <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
                {forum.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {forum.topics.length} tópico{forum.topics.length === 1 ? "" : "s"}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={2} aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function VideosPanel() {
  if (!apologeticsVideoLinks.length) {
    return <ComingSoonPanel title="Videos apologéticos" />;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {apologeticsVideoLinks.map((video) => (
        <li key={video.url}>
          <a
            href={video.url}
            className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 font-semibold text-[var(--accent)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 no-underline"
            target="_blank"
            rel="noreferrer"
          >
            {video.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ApologeticaIndex() {
  const [activeTab, setActiveTab] = useState<ApologeticaTab>("guias");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-6 lg:space-y-10">
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="inline-flex items-center transition hover:text-[var(--accent)]"
              aria-label="Inicio"
            >
              <Home className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </li>
          <li aria-hidden className="text-[var(--text-muted)]/50">
            /
          </li>
          <li>
            <Link href="/" className="transition hover:text-[var(--accent)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="text-[var(--text-muted)]/50">
            /
          </li>
          <li className="font-medium text-[var(--text)]" aria-current="page">
            Apologética
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <header className="w-full shrink-0 space-y-2 lg:w-[min(100%,18rem)] lg:pt-1">
          <h1 className="font-serif-display text-4xl font-semibold tracking-normal text-[var(--text)] sm:text-[2.65rem]">
            Apologética
          </h1>
          <p className="text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]">
            {apologeticaPageDescription}
          </p>
        </header>
        <HeroFeatureCard />
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "guias" ? (
        <>
          <section className="space-y-5" aria-labelledby="guias-apologetica">
            <SectionTitle>Guías bíblicas para apologética</SectionTitle>
            <div id="guias-apologetica" className="grid gap-4 lg:grid-cols-2">
              {apologeticaGuides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>

          <section className="space-y-5" aria-labelledby="mas-recursos-apologetica">
            <SectionTitle>Más recursos de apologética</SectionTitle>
            <div
              id="mas-recursos-apologetica"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {apologeticaMoreResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "temas" ? <ComingSoonPanel title="Temas frecuentes" /> : null}
      {activeTab === "debates" ? <DebatesPanel /> : null}
      {activeTab === "videos" ? <VideosPanel /> : null}
    </div>
  );
}
