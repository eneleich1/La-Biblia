import { BookText } from "lucide-react";
import Link from "next/link";
import type { BibleExample } from "@/components/apologetics/types";

type BibleExampleCardProps = {
  example: BibleExample;
};

export function BibleExampleCard({ example }: BibleExampleCardProps) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-2.5">
        <BookText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text)]">{example.title}</h4>
          {example.reference ? (
            example.referenceHref ? (
              <Link href={example.referenceHref} className="mt-0.5 block text-xs font-semibold text-[var(--accent)] hover:underline">
                {example.reference}
              </Link>
            ) : (
              <p className="mt-0.5 text-xs font-semibold text-[var(--accent)]">{example.reference}</p>
            )
          ) : null}
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">&ldquo;{example.body}&rdquo;</p>
        </div>
      </div>
    </article>
  );
}
