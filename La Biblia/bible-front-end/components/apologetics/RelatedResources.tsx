import Link from "next/link";
import { ArrowRight, BookOpen, MessagesSquare, PlayCircle, ScrollText } from "lucide-react";
import type { RelatedResource } from "@/components/apologetics/types";

const iconByKey: Record<string, typeof BookOpen> = {
  "Guías de apologética": ScrollText,
  "Debates y respuestas": MessagesSquare,
  "Videos apologéticos": PlayCircle,
  "Historia de la Iglesia": BookOpen,
};

type RelatedResourcesProps = {
  title: string;
  resources: RelatedResource[];
};

export function RelatedResources({ title, resources }: RelatedResourcesProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <h3 className="font-serif-display text-base font-semibold text-[var(--text)]">{title}</h3>
      <ul className="mt-3 space-y-1.5">
        {resources.map((resource) => {
          const Icon = iconByKey[resource.label] ?? ScrollText;
          return (
            <li key={resource.label}>
              <Link
                href={resource.href}
                className="group flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-[var(--text)] transition hover:bg-[var(--background-soft)]"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.75} aria-hidden />
                  <span className="truncate">{resource.label}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition group-hover:text-[var(--accent)]" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
