import Link from "next/link";
import { ArrowLeft, BookOpen, List } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopicHero } from "@/components/apologetics/TopicHero";
import { RelatedResources } from "@/components/apologetics/RelatedResources";
import { SaintsGuideTopicNavigation } from "@/components/apologetics/SaintsGuideTopicNavigation";
import { ArgumentsAccordion } from "@/components/apologetics/ArgumentsAccordion";
import {
  catholicArgumentsRelatedResources,
  catholicArgumentsScriptureQuote,
  catholicChurchArguments,
  catholicChurchArgumentsIntro,
} from "@/data/apologetics/saintsCatholicArgumentsContent";
import { linkifyBibleReferencesInPlainText } from "@/lib/linkifyBibleReferences";
import {
  saintsGuideParentHref,
  saintsGuideTopicNavigation,
} from "@/data/apologetics/saintsGuideTopicNav";
import type { TopicParentLink } from "@/components/apologetics/types";
import type { LucideIcon } from "lucide-react";

const ARGUMENTS_TOPIC_SLUG = "argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos";

export type SaintsCatholicArgumentsLayoutProps = {
  title: string;
  subtitle: string;
  parent: TopicParentLink;
  backLabel?: string;
  Icon: LucideIcon;
  books: { slug: string; nameEs: string }[];
};

export function SaintsCatholicArgumentsLayout({
  title,
  subtitle,
  parent,
  backLabel,
  Icon,
  books,
}: SaintsCatholicArgumentsLayoutProps) {
  const linkedArguments = catholicChurchArguments.map((argument) => ({
    id: argument.id,
    title: argument.title,
    bodyHtml: linkifyBibleReferencesInPlainText(argument.body, books),
  }));
  const leftRail = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <SaintsGuideTopicNavigation
        items={saintsGuideTopicNavigation}
        activeSlug={ARGUMENTS_TOPIC_SLUG}
        parentHref={parent.href}
      />
    </div>
  );

  const rightRail = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="flex items-start gap-2.5">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
          <div className="min-w-0">
            <h3 className="font-serif-display text-base font-semibold text-[var(--text)]">Dentro de este tema</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{parent.label}</p>
            <Link
              href={parent.href}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Ver tema completo
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <RelatedResources title="Recursos relacionados" resources={catholicArgumentsRelatedResources} />

      <blockquote className="rounded-xl border border-[var(--border)] bg-[#fbf6ee] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <span className="font-serif-display text-4xl leading-none text-[var(--accent)]/50" aria-hidden>
          &ldquo;
        </span>
        <p className="mt-1 font-serif-display text-sm italic leading-relaxed text-[var(--text)]/90">
          {catholicArgumentsScriptureQuote.text}
        </p>
        <footer className="mt-3 text-sm font-semibold text-[var(--accent)]">
          — {catholicArgumentsScriptureQuote.reference}
        </footer>
      </blockquote>
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

        <TopicHero
          title={title}
          subtitle={subtitle}
          Icon={Icon}
          decorImageSrc="/apologetica/icons/hero-illustration.svg"
        />

        <div className="space-y-4 lg:hidden">
          <SaintsGuideTopicNavigation
            items={saintsGuideTopicNavigation}
            activeSlug={ARGUMENTS_TOPIC_SLUG}
            parentHref={saintsGuideParentHref}
          />
        </div>

        <section id="argumentos" className="scroll-mt-24 space-y-4">
          <div className="flex items-start gap-2">
            <List className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
            <h2 className="font-serif-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
              Argumentos principales
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">{catholicChurchArgumentsIntro}</p>
          <ArgumentsAccordion arguments={linkedArguments} />
        </section>
      </article>
    </PageShell>
  );
}
