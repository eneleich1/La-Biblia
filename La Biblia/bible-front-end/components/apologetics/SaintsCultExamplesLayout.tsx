"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Check, Landmark } from "lucide-react";
import { SaintsCultVideosSection } from "@/components/apologetics/SaintsCultVideosSection";
import { PageShell } from "@/components/layout/PageShell";
import { TopicHero } from "@/components/apologetics/TopicHero";
import { TopicNavigation } from "@/components/apologetics/TopicNavigation";
import { RelatedResources } from "@/components/apologetics/RelatedResources";
import {
  saintsCultExamplesNav,
  saintsCultExamplesRelated,
  saintsCultUniversalBullets,
} from "@/data/apologetics/saintsCultExamplesContent";

export type SaintsCultExamplesLayoutProps = {
  title: string;
  subtitle: string;
  parent: { label: string; href: string };
  backLabel?: string;
};

export function SaintsCultExamplesLayout({ title, subtitle, parent, backLabel }: SaintsCultExamplesLayoutProps) {
  const [activeId, setActiveId] = useState<string>(saintsCultExamplesNav[0].id);

  useEffect(() => {
    const sectionIds = saintsCultExamplesNav.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element != null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.4] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const navItems = saintsCultExamplesNav.map((item) => ({ id: item.id, label: item.label }));

  const leftRail = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <TopicNavigation
        title="Navegación del tema"
        items={navItems}
        activeId={activeId}
        variant="bar"
      />
    </div>
  );

  const rightRail = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <h3 className="font-serif-display text-base font-semibold text-[var(--text)]">Dentro de este tema</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{parent.label}</p>
        <Link
          href={parent.href}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          Ver tema completo
          <span aria-hidden>→</span>
        </Link>
      </section>

      <RelatedResources title="Recursos relacionados" resources={saintsCultExamplesRelated} />
    </div>
  );

  return (
    <PageShell leftRail={leftRail} rightRail={rightRail}>
      <article className="mx-auto w-full max-w-[920px] space-y-5 pb-8">
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
                Apologética
              </Link>
            </li>
            <li aria-hidden className="opacity-40">
              /
            </li>
            <li>
              <Link href={parent.href} className="transition hover:text-[var(--accent)]">
                {parent.label}
              </Link>
            </li>
            <li aria-hidden className="opacity-40">
              /
            </li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>

        <Link
          href={parent.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          {backLabel ?? `Volver a ${parent.label}`}
        </Link>

        <TopicHero title={title} subtitle={subtitle} Icon={BookOpen} />

        <div className="space-y-4 lg:hidden">
          <TopicNavigation title="Navegación del tema" items={navItems} activeId={activeId} variant="bar" />
        </div>

        <section
          id="iglesia-catolica-universal"
          className="scroll-mt-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5"
        >
          <div className="flex items-start gap-2">
            <Landmark className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
            <h2 className="font-serif-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
              Iglesia Católica Universal
            </h2>
          </div>
          <ul className="mt-4 space-y-2.5">
            {saintsCultUniversalBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--text)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2.5} aria-hidden />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        <SaintsCultVideosSection />

        <section
          id="conclusion"
          className="scroll-mt-24 rounded-xl border border-[var(--border)] bg-[#fbf6ee] p-4 sm:p-5"
        >
          <h2 className="font-serif-display text-lg font-semibold text-[var(--text)]">Conclusión</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Estos ejemplos ilustran prácticas devocionales que desvían el culto debido a Dios. Para profundizar en la
            respuesta bíblica, continúa con los argumentos y refutaciones de esta guía.
          </p>
          <Link
            href={`${parent.href}/topicos/argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Ver argumentos de la Iglesia Católica para permitir el culto a los santos
            <span aria-hidden>→</span>
          </Link>
        </section>
      </article>
    </PageShell>
  );
}
