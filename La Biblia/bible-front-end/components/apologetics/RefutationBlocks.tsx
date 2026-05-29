import type { FeaturedScripture, ParsedRefutation } from "@/lib/parseSaintsRefutations";

type RefutationBlocksProps = {
  refutations: ParsedRefutation[];
  linkify: (text: string) => string;
};

function LinkedParagraph({ html }: { html: string }) {
  return (
    <p
      className="text-sm leading-relaxed text-[var(--text)]/90 sm:text-[0.9375rem] [&_a]:font-semibold [&_a]:text-[var(--accent)] [&_a]:hover:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function FeaturedScriptureCallout({
  featured,
  linkify,
}: {
  featured: FeaturedScripture;
  linkify: (text: string) => string;
}) {
  const referenceHtml = linkify(featured.reference);

  return (
    <blockquote className="mt-3.5 rounded-lg border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--background)] to-[var(--background-soft)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="flex items-start gap-1.5">
        <span
          className="-mt-0.5 shrink-0 font-serif-display text-2xl leading-none text-[var(--accent)]/30"
          aria-hidden
        >
          &ldquo;
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="font-serif-display text-sm italic leading-snug text-[var(--text)]/90"
            dangerouslySetInnerHTML={{ __html: linkify(featured.lead) }}
          />
          <p
            className="mt-1 text-xs font-semibold leading-tight [&_a]:text-[var(--accent)] [&_a]:hover:underline"
            dangerouslySetInnerHTML={{ __html: referenceHtml }}
          />
          {featured.verses.length > 0 ? (
            <div className="mt-2 space-y-1 border-t border-[var(--border)]/80 pt-2">
              {featured.verses.map((verse) => (
                <p
                  key={verse.slice(0, 40)}
                  className="text-xs italic leading-snug text-[var(--text)]/80"
                  dangerouslySetInnerHTML={{ __html: linkify(verse) }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </blockquote>
  );
}

function CommandmentsGrid({
  items,
  linkify,
}: {
  items: NonNullable<ParsedRefutation["commandments"]>;
  linkify: (text: string) => string;
}) {
  return (
    <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.number}
          className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[#fbf7ef] px-3 py-3"
        >
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--surface)] text-xs font-semibold text-[var(--accent)]"
            aria-hidden
          >
            {item.number}
          </span>
          <p
            className="text-sm leading-snug text-[var(--text)]/90 [&_a]:font-semibold [&_a]:text-[var(--accent)] [&_a]:hover:underline"
            dangerouslySetInnerHTML={{ __html: linkify(item.text) }}
          />
        </article>
      ))}
    </div>
  );
}

export function RefutationBlocks({ refutations, linkify }: RefutationBlocksProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-6">
      <ol className="relative m-0 list-none p-0">
        {refutations.map((refutation, index) => {
          const isLast = index === refutations.length - 1;

          return (
            <li
              key={refutation.number}
              id={`refutacion-${refutation.number}`}
              className={`relative scroll-mt-24 pl-11 ${isLast ? "" : "pb-10"}`}
            >
              {!isLast ? (
                <span
                  className="absolute bottom-0 left-4 top-8 w-px bg-[var(--accent)]/25"
                  aria-hidden
                />
              ) : null}

              <span
                className="absolute left-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[#fbf6ee] text-sm font-semibold text-[var(--accent)]"
                aria-hidden
              >
                {refutation.number}
              </span>

              <div className="min-w-0">
                <h2 className="font-serif-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
                  Refutación al argumento {refutation.number}
                </h2>

                <div className="mt-3 space-y-3">
                  {refutation.paragraphs.map((paragraph) => (
                    <LinkedParagraph key={paragraph.slice(0, 64)} html={linkify(paragraph)} />
                  ))}
                </div>

                {refutation.commandments?.length ? (
                  <CommandmentsGrid items={refutation.commandments} linkify={linkify} />
                ) : null}

                {refutation.numberedPoints?.length ? (
                  <ol className="mt-4 list-none space-y-2.5 p-0">
                    {refutation.numberedPoints.map((point, pointIndex) => (
                      <li key={point.slice(0, 48)} className="flex items-start gap-2.5">
                        <span
                          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3e8d8] text-xs font-semibold text-[var(--accent)]"
                          aria-hidden
                        >
                          {pointIndex + 1}
                        </span>
                        <LinkedParagraph html={linkify(point)} />
                      </li>
                    ))}
                  </ol>
                ) : null}

                {refutation.featuredScripture ? (
                  <FeaturedScriptureCallout featured={refutation.featuredScripture} linkify={linkify} />
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
