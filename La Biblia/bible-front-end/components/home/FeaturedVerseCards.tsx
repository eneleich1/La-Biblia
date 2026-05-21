import Link from "next/link";
import { CalendarDays, Quote } from "lucide-react";

type FeaturedVerseCardsProps = {
  className?: string;
};

export function FeaturedVerseCards({ className = "" }: FeaturedVerseCardsProps) {
  return (
    <div
      className={`grid max-w-[42rem] grid-cols-1 gap-5 sm:grid-cols-2 lg:max-w-[43rem] xl:max-w-[45rem] ${className}`}
    >
      <article className="relative overflow-hidden rounded-lg border border-[#0c356f]/10 bg-[var(--surface-strong)] p-5 text-[var(--accent-foreground)] shadow-[var(--shadow-card)] sm:min-h-[10.5rem] sm:p-5">
        <div
          className="pointer-events-none absolute bottom-4 right-4 h-16 w-28 text-white opacity-[0.12]"
          aria-hidden
        >
          <svg viewBox="0 0 140 82" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M69 24C54 12 35 9 16 17v43c20-7 38-4 53 9V24Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path d="M71 24c15-12 34-15 53-7v43c-20-7-38-4-53 9V24Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path d="M22 24c14-4 27-2 40 6M78 30c13-8 27-10 40-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".55" />
            <path d="M6 68c22-9 44-7 63 8 19-15 41-17 65-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".75" />
          </svg>
        </div>
        <div className="relative flex gap-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/25"
            aria-hidden
          >
            <CalendarDays className="h-5 w-5 text-white/95" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#58a2ff]">
              Lectura del día
            </p>
            <h2 className="mt-1 font-serif-display text-xl font-semibold leading-tight">
              Salmo 119:105
            </h2>
            <p className="mt-2 text-sm italic leading-snug text-white/90">
              Lámpara es a mis pies tu palabra, y lumbrera a mi camino.
            </p>
            <Link
              href="/lecturas-del-dia"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#62b0ff] no-underline visited:text-[#62b0ff] underline-offset-4 transition hover:underline"
            >
              Leer ahora
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-lg border border-[#cfe4f7] bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(247,252,255,0.92)_54%,rgba(231,243,255,0.76)_100%)] p-5 shadow-[var(--shadow-card)] sm:min-h-[10.5rem] sm:p-5">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(ellipse_at_center,rgba(214,234,255,0.58)_0%,rgba(232,244,255,0.28)_48%,transparent_76%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-4 top-10 w-24 text-[#9dc8f5] opacity-55 sm:w-28"
          aria-hidden
        >
          <svg
            viewBox="0 0 130 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <path d="M62 156C65 114 64 70 54 25" stroke="currentColor" strokeWidth="2" />
            <path d="M62 112C84 101 99 84 106 61C82 66 67 82 62 112Z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.08" />
            <path d="M58 91C35 82 21 67 14 46C39 49 53 65 58 91Z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.08" />
            <path d="M58 59C78 50 91 35 96 15C75 18 62 34 58 59Z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.08" />
            <path d="M64 137C88 128 105 111 114 87C88 92 70 110 64 137Z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.08" />
          </svg>
        </div>
        <div className="relative pr-24 sm:pr-28">
          <div className="flex items-start gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white ring-1 ring-[var(--border)]"
              aria-hidden
            >
              <Quote className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
              Versículo al azar
              </p>
              <h2 className="mt-1 font-serif-display text-xl font-semibold leading-tight text-[var(--text)]">
                Romanos 8:28
              </h2>
            </div>
          </div>
          <p className="mt-3 max-w-[19rem] text-sm italic leading-snug text-[var(--text)]">
            Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.
          </p>
          <Link
            href="/buscar"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] no-underline visited:text-[var(--text)] underline-offset-4 transition hover:underline"
          >
            Ver otro versículo
            <span aria-hidden>→</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
