"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Palette, Settings } from "lucide-react";
import {
  useSiteTheme,
  type BibleIndexMode,
  type SiteTheme,
} from "@/components/theme/ThemeProvider";

const options: { id: SiteTheme; label: string }[] = [
  { id: "blue", label: "Tema azul claro" },
  { id: "warm", label: "Tema calido" },
];

const bibleIndexOptions: { id: BibleIndexMode; label: string }[] = [
  { id: "natural", label: "Orden natural" },
  { id: "grouped", label: "Agrupado por categorias" },
];

export function ThemeSettings() {
  const { theme, setTheme, bibleIndexMode, setBibleIndexMode } = useSiteTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Ajustes"
      >
        <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="hidden sm:inline">Ajustes</span>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1 min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
          role="menu"
        >
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            <Palette className="h-3.5 w-3.5" strokeWidth={2} />
            Tema
          </div>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setTheme(opt.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-[var(--background-soft)]"
            >
              {opt.label}
              {theme === opt.id && (
                <Check className="h-4 w-4 text-[var(--accent)]" strokeWidth={2} />
              )}
            </button>
          ))}

          <div className="mt-1 flex items-center gap-2 border-b border-t border-[var(--border)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
            Indice biblico
          </div>
          {bibleIndexOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setBibleIndexMode(opt.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-[var(--background-soft)]"
            >
              {opt.label}
              {bibleIndexMode === opt.id && (
                <Check className="h-4 w-4 text-[var(--accent)]" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
