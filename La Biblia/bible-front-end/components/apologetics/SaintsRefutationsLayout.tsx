import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopicHero } from "@/components/apologetics/TopicHero";
import { RelatedResources } from "@/components/apologetics/RelatedResources";
import { SaintsGuideTopicNavigation } from "@/components/apologetics/SaintsGuideTopicNavigation";
import { RefutationBlocks } from "@/components/apologetics/RefutationBlocks";
import { catholicArgumentsRelatedResources } from "@/data/apologetics/saintsCatholicArgumentsContent";
import { linkifyBibleReferencesInPlainText } from "@/lib/linkifyBibleReferences";
import { parseSaintsRefutationsHtml } from "@/lib/parseSaintsRefutations";
import {
  saintsGuideParentHref,
  saintsGuideTopicNavigation,
} from "@/data/apologetics/saintsGuideTopicNav";
import type { TopicParentLink } from "@/components/apologetics/types";
import type { LucideIcon } from "lucide-react";

const REFUTATIONS_TOPIC_SLUG = "refutaciones-argumentos-iglesia-catolica";

export type SaintsRefutationsLayoutProps = {
  title: string;
  subtitle: string;
  parent: TopicParentLink;
  backLabel?: string;
  Icon: LucideIcon;
  html: string;
  books: { slug: string; nameEs: string }[];
};

export function SaintsRefutationsLayout({
  title,
  subtitle,
  parent,
  backLabel,
  Icon,
  html,
  books,
}: SaintsRefutationsLayoutProps) {
  const linkify = (text: string) => linkifyBibleReferencesInPlainText(text, books);
  const refutations = parseSaintsRefutationsHtml(html);

  const leftRail = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <SaintsGuideTopicNavigation
        items={saintsGuideTopicNavigation}
        activeSlug={REFUTATIONS_TOPIC_SLUG}
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

        <TopicHero title={title} subtitle={subtitle} Icon={Icon} />

        <div className="space-y-4 lg:hidden">
          <SaintsGuideTopicNavigation
            items={saintsGuideTopicNavigation}
            activeSlug={REFUTATIONS_TOPIC_SLUG}
            parentHref={saintsGuideParentHref}
          />
        </div>

        <RefutationBlocks refutations={refutations} linkify={linkify} />
      </article>
    </PageShell>
  );
}
