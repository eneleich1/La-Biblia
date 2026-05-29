import Link from "next/link";
import { ListTree } from "lucide-react";
import type { TopicNavItem } from "@/components/apologetics/types";

type TopicNavigationProps = {
  title: string;
  items: TopicNavItem[];
  activeId?: string;
  compact?: boolean;
  variant?: "dot" | "bar";
};

export function TopicNavigation({
  title,
  items,
  activeId,
  compact = false,
  variant = "dot",
}: TopicNavigationProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center gap-2">
        <ListTree className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      </div>
      <ul
        className={
          variant === "bar"
            ? "mt-4 space-y-1"
            : "relative mt-4 space-y-1.5 pl-2 before:absolute before:bottom-2 before:left-[0.42rem] before:top-2 before:w-px before:bg-[var(--border)]"
        }
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                className={`relative flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm leading-snug transition ${
                  variant === "bar" && isActive
                    ? "border-l-[3px] border-[var(--accent)] bg-[#fbf6ee] pl-[calc(0.5rem-3px)] font-semibold text-[var(--text)]"
                    : variant === "bar"
                      ? "border-l-[3px] border-transparent text-[var(--text-muted)] hover:bg-[var(--background-soft)] hover:text-[var(--text)]"
                      : isActive
                        ? "font-semibold text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--background-soft)] hover:text-[var(--text)]"
                }`}
              >
                {variant === "dot" ? (
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border bg-[var(--surface)] ${
                      isActive ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--accent)]/35"
                    }`}
                    aria-hidden
                  />
                ) : (
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full border ${
                      isActive ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--accent)]/40 bg-[var(--surface)]"
                    }`}
                    aria-hidden
                  />
                )}
                <span className="min-w-0">
                  {item.label}
                  {!compact && item.children?.length ? (
                    <span className="mt-1 block space-y-0.5 text-xs font-normal text-[var(--text-muted)]">
                      {item.children.map((child) => (
                        <span key={child} className="block">
                          - {child}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
