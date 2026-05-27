import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FeaturedCardNavProps = {
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  previousLabel: string;
  nextLabel: string;
  variant?: "verse" | "daily";
  linkHref?: string;
  linkLabel?: string;
};

export function FeaturedCardNav({
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  nextLoading = false,
  previousLabel,
  nextLabel,
  variant = "verse",
  linkHref,
  linkLabel = "Leer",
}: FeaturedCardNavProps) {
  const isDaily = variant === "daily";
  const buttonClassName = isDaily
    ? "inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-[0_8px_16px_-12px_rgba(0,0,0,0.55)] transition hover:border-white/40 hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-40"
    : "inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 text-[var(--text)] shadow-[0_8px_16px_-12px_rgba(15,23,42,0.45)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40";
  const linkClassName = isDaily
    ? "text-sm font-semibold text-[#62b0ff] no-underline underline-offset-4 hover:underline"
    : "text-sm font-semibold text-[var(--accent)] no-underline underline-offset-4 hover:underline";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        className={buttonClassName}
        aria-label={previousLabel}
        title={previousLabel}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={`${buttonClassName} disabled:opacity-60`}
        aria-label={nextLabel}
        title={nextLabel}
        aria-busy={nextLoading}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
      {linkHref ? (
        <Link href={linkHref} className={linkClassName}>
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
