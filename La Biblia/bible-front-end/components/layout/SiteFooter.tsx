import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

const footerLinks = [
  { href: "#", label: "Acerca de" },
  { href: "#", label: "Privacidad" },
  { href: "#", label: "Términos" },
  { href: "#", label: "Contacto" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto px-1">
      <div className="mx-auto flex max-w-[1840px] flex-col gap-3 border-t border-[var(--border)] bg-[var(--background-soft)] px-6 py-4 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-2.5 text-[var(--text)]">
          <BookOpenCheck
            className="h-8 w-8 shrink-0 text-[var(--text-muted)]"
            strokeWidth={1.45}
            aria-hidden
          />
          <p className="font-serif-display text-sm italic leading-none text-[var(--text-muted)] sm:text-[0.95rem]">
            “Tu palabra es verdad” · Juan 17:17
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[var(--text-muted)] md:justify-center"
          aria-label="Pie de página"
        >
          {footerLinks.map((l, i) => (
            <span key={l.label} className="contents">
              {i > 0 ? <span className="text-[var(--text-muted)]/60">·</span> : null}
              <Link href={l.href} className="transition hover:text-[var(--accent)]">
                {l.label}
              </Link>
            </span>
          ))}
        </nav>

        <span
          className="hidden font-serif-display text-4xl leading-none text-[var(--accent)] md:block"
          aria-hidden
        >
          ✝
        </span>
      </div>
    </footer>
  );
}
