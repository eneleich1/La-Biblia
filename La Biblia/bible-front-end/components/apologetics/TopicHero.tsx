import type { LucideIcon } from "lucide-react";

type TopicHeroProps = {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
};

export function TopicHero({ title, subtitle, Icon }: TopicHeroProps) {
  return (
    <header className="rounded-xl border border-[var(--border)] bg-[#fbf6ee] px-5 py-5 shadow-[var(--shadow-card)] sm:px-7">
      <div className="flex items-start gap-4 sm:gap-5">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--surface)] text-[var(--accent)]">
          <Icon className="h-7 w-7" strokeWidth={1.7} aria-hidden />
        </span>
        <div className="min-w-0">
          <h1 className="font-serif-display text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
