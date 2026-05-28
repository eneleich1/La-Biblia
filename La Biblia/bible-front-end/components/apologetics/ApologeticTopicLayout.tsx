import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Crown,
  Cross,
  Hand,
  HeartHandshake,
  Landmark,
  PersonStanding,
  Sparkles,
  Trophy,
  UsersRound,
  Wine,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopicHero } from "@/components/apologetics/TopicHero";
import { TopicNavigation } from "@/components/apologetics/TopicNavigation";
import { ScriptureCallout } from "@/components/apologetics/ScriptureCallout";
import { BibleExampleCard } from "@/components/apologetics/BibleExampleCard";
import { RelatedResources } from "@/components/apologetics/RelatedResources";
import type { ApologeticTopicPageData } from "@/components/apologetics/types";

type ApologeticTopicLayoutProps = {
  topic: ApologeticTopicPageData;
  books: { slug: string; nameEs: string }[];
};

export function ApologeticTopicLayout({ topic, books }: ApologeticTopicLayoutProps) {
  const manifestIconByKey = {
    hands: Hand,
    crown: Crown,
    badge: BadgeCheck,
    chalice: Wine,
    users: UsersRound,
    landmark: Landmark,
    person: PersonStanding,
    heart: HeartHandshake,
    sparkle: Sparkles,
    calendar: CalendarDays,
    cross: Cross,
  } as const;

  const leftRail = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <TopicNavigation title="Navegación del tema" items={topic.nav} activeId={topic.nav[0]?.id} />
    </div>
  );

  const rightRail = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <TopicNavigation
        title="Navegación del tema"
        items={topic.rightNav.map((item) => ({ id: item.href.replace("#", ""), label: item.label }))}
        compact
      />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <h3 className="font-serif-display text-base font-semibold text-[var(--text)]">Dentro de este tema</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{topic.parent.label}</p>
        <Link href={topic.parent.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline">
          Ver tema completo
          <span aria-hidden>→</span>
        </Link>
      </section>

      <RelatedResources title="Recursos relacionados" resources={topic.relatedResources} />
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
              <Link href={topic.parent.href} className="transition hover:text-[var(--accent)]">
                {topic.parent.label}
              </Link>
            </li>
            <li aria-hidden className="opacity-40">
              /
            </li>
            <li aria-current="page">{topic.title}</li>
          </ol>
        </nav>

        <Link
          href={topic.parent.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          {topic.backLabel ?? `Volver a ${topic.parent.label}`}
        </Link>

        <TopicHero title={topic.title} subtitle={topic.subtitle} Icon={topic.icon} />

        <div className="space-y-4 lg:hidden">
          <TopicNavigation title="Navegación del tema" items={topic.nav} activeId={topic.nav[0]?.id} />
        </div>

        <main className="space-y-4">
          {topic.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5"
            >
              <div className="flex items-start gap-2">
                <Landmark className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
                <h2 className="font-serif-display text-xl font-semibold text-[var(--text)] sm:text-2xl">{section.title}</h2>
              </div>

              {section.intro ? <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{section.intro}</p> : null}

              {section.manifestItems?.length ? (
                <div className="mt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-[var(--border)]" />
                    <Trophy className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
                    <span className="h-px flex-1 bg-[var(--border)]" />
                  </div>
                  <div className="grid gap-2.5 md:grid-cols-2">
                    {section.manifestItems.map((item) => {
                      const Icon = manifestIconByKey[item.icon as keyof typeof manifestIconByKey] ?? Landmark;
                      const content = (
                        <>
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background-soft)] text-[var(--accent)]">
                            <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-tight text-[var(--text)]">{item.title}</span>
                            {item.description ? (
                              <span className="mt-1 block text-sm leading-relaxed text-[var(--text)]/80">{item.description}</span>
                            ) : null}
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.8} aria-hidden />
                        </>
                      );

                      if (item.href) {
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3 transition hover:border-[var(--accent)]/35 hover:bg-[var(--background-soft)]"
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <article key={item.id} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                          {content}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {section.bullets?.length ? (
                <ul className="mt-3 space-y-1.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="text-sm leading-relaxed text-[var(--text)]">
                      - {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.scriptureBlockTitle && section.scriptures?.length ? (
                <div className="mt-4">
                  <ScriptureCallout
                    title={section.scriptureBlockTitle}
                    scriptures={section.scriptures}
                    quote={section.quote}
                    books={books}
                  />
                </div>
              ) : null}

              {section.examplesTitle && section.examples?.length ? (
                <div className="mt-4">
                  <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">{section.examplesTitle}</h3>
                  <div className="mt-2.5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                    {section.examples.map((example) => (
                      <BibleExampleCard key={example.id} example={example} />
                    ))}
                  </div>
                </div>
              ) : null}

              {section.afterBullets?.length ? (
                <ul className="mt-3 space-y-1.5">
                  {section.afterBullets.map((bullet) => (
                    <li key={bullet} className="text-sm leading-relaxed text-[var(--text-muted)]">
                      - {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.verseCards?.length ? (
                <div className="mt-4">
                  {section.verseDeckTitle ? (
                    <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">{section.verseDeckTitle}</h3>
                  ) : null}
                  {section.verseReference ? (
                    section.verseReferenceHref ? (
                      <Link href={section.verseReferenceHref} className="mt-1 block text-sm font-semibold text-[var(--accent)] hover:underline">
                        {section.verseReference}
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-[var(--accent)]">{section.verseReference}</p>
                    )
                  ) : null}
                  <div className="mt-2 grid gap-2.5 md:grid-cols-2">
                    {section.verseCards.map((card) => (
                      <article key={card.id} className="rounded-md border border-[var(--border)] bg-[#fbf7ef] px-3 py-3 text-sm leading-relaxed text-[var(--text)]/90">
                        {card.text}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {section.html ? (
                <div className="content-html mt-4 rounded-md border border-[var(--border)] bg-[#fbf7ef] px-3 py-3" dangerouslySetInnerHTML={{ __html: section.html }} />
              ) : null}
            </section>
          ))}
        </main>
      </article>
    </PageShell>
  );
}
