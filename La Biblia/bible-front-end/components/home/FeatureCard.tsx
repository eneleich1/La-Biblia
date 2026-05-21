import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type FeatureCardProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeatureCard({ href, title, description, icon: Icon }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[8.4rem] items-center gap-5 rounded-lg border border-[var(--border)] bg-white px-6 py-5 text-[var(--text)] no-underline shadow-[var(--shadow-card)] transition visited:text-[var(--text)] hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
    >
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--text)] ring-1 ring-[#d8ebff] transition group-hover:ring-[var(--accent)]/25">
        <Icon className="h-9 w-9" strokeWidth={1.65} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif-display text-xl font-semibold leading-snug text-[var(--text)]">
            {title}
          </h3>
          <ChevronRight
            className="mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)] opacity-75 transition group-hover:translate-x-0.5 group-hover:opacity-100"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <p className="mt-1.5 text-[15px] leading-snug text-[var(--text)]">
          {description}
        </p>
      </div>
    </Link>
  );
}
