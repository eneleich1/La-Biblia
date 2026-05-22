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
      <div className="mx-auto grid max-w-[1840px] grid-cols-1 gap-8 border-t border-[var(--border)] bg-[var(--background-soft)] px-6 py-8 sm:px-8 md:grid-cols-[1fr_auto_1fr_auto] md:items-center lg:px-12">
        <div className="flex items-start gap-3 text-[var(--text)]">
          <BookOpenCheck
            className="mt-0.5 h-10 w-10 shrink-0 text-[var(--text-muted)]"
            strokeWidth={1.45}
            aria-hidden
          />
          <div>
            <p className="font-serif-display text-base italic leading-snug text-[var(--text-muted)]">
              “Tu palabra es verdad”
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Juan 17:17</p>
          </div>
        </div>

        <nav
          className="flex flex-wrap items-center justify-start gap-x-5 gap-y-2 text-sm text-[var(--text-muted)] md:justify-center"
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

        <div className="text-left md:text-left">
          <p className="text-sm font-medium leading-relaxed text-[var(--text)]">
            Seek of Truth - Plataforma Bíblica Cristiana
          </p>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
            Jerusalem Bible Platform - datos bíblicos importados desde fuentes JSON locales.
          </p>
        </div>

        <span
          className="font-serif-display text-6xl leading-none text-[var(--accent)]"
          aria-hidden
        >
          ✝
        </span>
      </div>
    </footer>
  );
}
