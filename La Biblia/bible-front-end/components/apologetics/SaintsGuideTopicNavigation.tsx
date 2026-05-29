import Link from "next/link";
import { ListTree } from "lucide-react";
import type { SaintsGuideTopicNavItem } from "@/data/apologetics/saintsGuideTopicNav";

type SaintsGuideTopicNavigationProps = {
  title?: string;
  items: SaintsGuideTopicNavItem[];
  activeSlug: string;
  parentHref: string;
};

export function SaintsGuideTopicNavigation({
  title = "Navegación del tema",
  items,
  activeSlug,
  parentHref,
}: SaintsGuideTopicNavigationProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center gap-2">
        <ListTree className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      </div>
      <ul className="relative mt-4 space-y-1.5 pl-2 before:absolute before:bottom-2 before:left-[0.42rem] before:top-2 before:w-px before:bg-[var(--border)]">
        {items.map((item) => {
          const isActive = activeSlug === item.slug;
          return (
            <li key={item.slug}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm leading-snug transition ${
                  isActive
                    ? "font-semibold text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--background-soft)] hover:text-[var(--text)]"
                }`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border bg-[var(--surface)] ${
                    isActive ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--accent)]/35"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href={parentHref}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        Ver tema completo
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
