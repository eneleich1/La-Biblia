"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Check, Clock, Palette, Settings, Type, X } from "lucide-react";
import {
  DEFAULT_BOOK_TITLE_MODE,
  DEFAULT_HERO_IMAGE_INTERVAL_MS,
  DEFAULT_RANDOM_VERSE_INTERVAL_MS,
  DEFAULT_READING_FONT_FAMILY,
  DEFAULT_READING_FONT_SIZE_REM,
  DEFAULT_READING_TEXT_COLOR,
  MAX_HERO_IMAGE_INTERVAL_MS,
  MAX_RANDOM_VERSE_INTERVAL_MS,
  MAX_READING_FONT_SIZE_REM,
  MIN_HERO_IMAGE_INTERVAL_MS,
  MIN_RANDOM_VERSE_INTERVAL_MS,
  MIN_READING_FONT_SIZE_REM,
  useSiteTheme,
  type BibleIndexMode,
  type ReadingFontFamily,
  type SiteTheme,
} from "@/components/theme/ThemeProvider";
import type { BookTitleMode } from "@/lib/formatTitle";

const themeOptions: { id: SiteTheme; label: string }[] = [
  { id: "blue", label: "Tema azul claro" },
  { id: "warm", label: "Tema calido" },
];

const bibleIndexOptions: { id: BibleIndexMode; label: string }[] = [
  { id: "natural", label: "Orden natural" },
  { id: "grouped", label: "Agrupado por categorias" },
];

const bookTitleOptions: { id: BookTitleMode; label: string }[] = [
  { id: "short", label: "Nombres cortos" },
  { id: "long", label: "Nombres largos" },
];

const readingFontOptions: { id: ReadingFontFamily; label: string }[] = [
  { id: "default", label: "Fuente actual" },
  { id: "georgia", label: "Georgia" },
  { id: "verdana", label: "Verdana" },
  { id: "arial", label: "Arial" },
  { id: "times", label: "Times New Roman" },
  { id: "consolas", label: "Consolas" },
];

type SettingsSection = "theme" | "bible-index" | "reading-font" | "home";

const settingsSections: {
  id: SettingsSection;
  label: string;
  icon: typeof Palette;
}[] = [
  { id: "theme", label: "Tema", icon: Palette },
  { id: "bible-index", label: "Indice biblico", icon: BookOpen },
  { id: "reading-font", label: "Fuente de lectura", icon: Type },
  { id: "home", label: "Inicio", icon: Clock },
];

type IntervalUnit = "seconds" | "minutes";

function intervalToFields(intervalMs: number): { value: number; unit: IntervalUnit } {
  if (intervalMs % 60_000 === 0) {
    return { value: intervalMs / 60_000, unit: "minutes" };
  }
  return { value: Math.round(intervalMs / 1000), unit: "seconds" };
}

function fieldsToInterval(value: number, unit: IntervalUnit) {
  const multiplier = unit === "minutes" ? 60_000 : 1000;
  return value * multiplier;
}

function OptionList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="grid gap-1 rounded-lg border border-[var(--border)] p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-[var(--background-soft)]"
        >
          {opt.label}
          {value === opt.id && (
            <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} />
          )}
        </button>
      ))}
    </div>
  );
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-[var(--text)]">{children}</h3>;
}

function PanelSubheading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
      {children}
    </p>
  );
}

export function ThemeSettings() {
  const {
    theme,
    setTheme,
    bibleIndexMode,
    setBibleIndexMode,
    bookTitleMode,
    setBookTitleMode,
    readingFontFamily,
    setReadingFontFamily,
    readingFontSizeRem,
    setReadingFontSizeRem,
    readingTextColor,
    setReadingTextColor,
    randomVerseIntervalMs,
    setRandomVerseIntervalMs,
    heroImageIntervalMs,
    setHeroImageIntervalMs,
  } = useSiteTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("theme");
  const ref = useRef<HTMLDivElement>(null);
  const intervalFields = intervalToFields(randomVerseIntervalMs);
  const intervalValue = intervalFields.value;
  const intervalUnit = intervalFields.unit;
  const heroIntervalFields = intervalToFields(heroImageIntervalMs);
  const heroIntervalValue = heroIntervalFields.value;
  const heroIntervalUnit = heroIntervalFields.unit;

  const activeSectionMeta = settingsSections.find((s) => s.id === activeSection)!;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function updateInterval(nextValue: number, nextUnit: IntervalUnit) {
    setRandomVerseIntervalMs(fieldsToInterval(nextValue, nextUnit));
  }

  function updateHeroInterval(nextValue: number, nextUnit: IntervalUnit) {
    setHeroImageIntervalMs(fieldsToInterval(nextValue, nextUnit));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((current) => !current);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ajustes"
      >
        <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="hidden sm:inline">Ajustes</span>
      </button>

      {open && mounted && createPortal(
        <div
          className="fixed top-20 right-4 z-[2147483647] w-[min(32rem,calc(100vw-2rem))]"
          role="dialog"
          aria-modal="false"
          aria-labelledby="settings-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex max-h-[calc(100dvh-5.5rem)] w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_-30px_rgba(15,23,42,0.62)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-3.5 py-2.5">
              <div>
                <h2 id="settings-title" className="text-base font-semibold text-[var(--text)]">
                  Ajustes
                </h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Preferencias de lectura y apariencia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
                aria-label="Cerrar ajustes"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex min-h-0 overflow-y-auto">
              <nav
                className="flex w-[8.25rem] shrink-0 flex-col gap-0.5 border-r border-[var(--border)] bg-[var(--background-soft)]/40 p-1.5"
                role="tablist"
                aria-label="Categorias de ajustes"
              >
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      id={`settings-tab-${section.id}`}
                      aria-selected={isActive}
                      aria-controls={`settings-panel-${section.id}`}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs leading-snug transition ${
                        isActive
                          ? "bg-[var(--surface)] font-semibold text-[var(--text)] shadow-sm"
                          : "font-medium text-[var(--text-muted)] hover:bg-[var(--surface)]/70 hover:text-[var(--text)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div
                className="min-w-0 flex-1 p-3"
                role="tabpanel"
                id={`settings-panel-${activeSection}`}
                aria-labelledby={`settings-tab-${activeSection}`}
              >
                <div className="mb-2.5 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <activeSectionMeta.icon
                    className="h-4 w-4 text-[var(--accent)]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <PanelHeading>{activeSectionMeta.label}</PanelHeading>
                </div>

                {activeSection === "theme" && (
                  <div className="grid gap-3">
                    <OptionList options={themeOptions} value={theme} onChange={setTheme} />
                  </div>
                )}

                {activeSection === "bible-index" && (
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <PanelSubheading>Orden del indice</PanelSubheading>
                      <OptionList
                        options={bibleIndexOptions}
                        value={bibleIndexMode}
                        onChange={setBibleIndexMode}
                      />
                    </div>
                    <div className="grid gap-2">
                      <PanelSubheading>Nombres de libros</PanelSubheading>
                      <OptionList
                        options={bookTitleOptions}
                        value={bookTitleMode}
                        onChange={setBookTitleMode}
                      />
                      <button
                        type="button"
                        onClick={() => setBookTitleMode(DEFAULT_BOOK_TITLE_MODE)}
                        className="w-fit rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] underline-offset-4 transition hover:bg-[var(--accent-soft)]"
                      >
                        Restaurar nombres
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === "reading-font" && (
                  <div className="rounded-lg border border-[var(--border)] p-3">
                    <label className="block text-sm font-medium text-[var(--text)]">
                      Familia tipografica
                    </label>
                    <select
                      value={readingFontFamily}
                      onChange={(e) => setReadingFontFamily(e.target.value as ReadingFontFamily)}
                      className="mt-2 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                    >
                      {readingFontOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <label className="mt-3 block text-sm font-medium text-[var(--text)]">
                      Tamano de fuente
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={MIN_READING_FONT_SIZE_REM}
                        max={MAX_READING_FONT_SIZE_REM}
                        step={0.01}
                        value={readingFontSizeRem}
                        onChange={(e) => setReadingFontSizeRem(Number(e.target.value))}
                        className="min-w-0 flex-1 accent-[var(--accent)]"
                      />
                      <span className="w-12 text-right text-xs font-semibold text-[var(--text-muted)]">
                        {readingFontSizeRem.toFixed(2)}rem
                      </span>
                    </div>

                    <label className="mt-3 block text-sm font-medium text-[var(--text)]">
                      Color de fuente
                    </label>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        type="color"
                        value={readingTextColor.startsWith("#") ? readingTextColor : "#0f172a"}
                        onChange={(e) => setReadingTextColor(e.target.value)}
                        className="h-9 w-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1"
                        aria-label="Color de fuente de lectura"
                      />
                      <input
                        type="text"
                        value={readingTextColor.startsWith("#") ? readingTextColor : ""}
                        readOnly
                        placeholder="#0f172a"
                        className="h-9 w-24 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setReadingFontFamily(DEFAULT_READING_FONT_FAMILY);
                          setReadingFontSizeRem(DEFAULT_READING_FONT_SIZE_REM);
                          setReadingTextColor(DEFAULT_READING_TEXT_COLOR);
                        }}
                        className="h-9 rounded-lg px-2.5 text-xs font-semibold text-[var(--accent)] underline-offset-4 transition hover:bg-[var(--accent-soft)]"
                      >
                        Restaurar
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Se aplica al texto de los versiculos; el estilo original queda como predeterminado.
                    </p>
                  </div>
                )}

                {activeSection === "home" && (
                  <div className="grid gap-3">
                    <div className="rounded-lg border border-[var(--border)] p-3">
                      <label className="block text-sm font-medium text-[var(--text)]">
                        Cambiar versiculo al azar cada
                      </label>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={intervalUnit === "minutes" ? 1 : 5}
                          max={intervalUnit === "minutes" ? 60 : 3600}
                          step={1}
                          value={intervalValue}
                          onChange={(e) => updateInterval(Number(e.target.value), intervalUnit)}
                          className="h-9 w-16 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-center text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                        />
                        <select
                          value={intervalUnit}
                          onChange={(e) =>
                            updateInterval(intervalValue, e.target.value as IntervalUnit)
                          }
                          className="h-9 w-28 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                        >
                          <option value="seconds">segundos</option>
                          <option value="minutes">minutos</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setRandomVerseIntervalMs(DEFAULT_RANDOM_VERSE_INTERVAL_MS)}
                          className="h-9 rounded-lg px-2.5 text-xs font-semibold text-[var(--accent)] underline-offset-4 transition hover:bg-[var(--accent-soft)]"
                        >
                          Restaurar
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        Minimo 5 segundos. Por defecto 1 minuto.
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        Rango: {MIN_RANDOM_VERSE_INTERVAL_MS / 1000}s a{" "}
                        {MAX_RANDOM_VERSE_INTERVAL_MS / 60_000} min.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] p-3">
                      <label className="block text-sm font-medium text-[var(--text)]">
                        Cambiar imagen principal cada
                      </label>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={heroIntervalUnit === "minutes" ? 1 : 10}
                          max={heroIntervalUnit === "minutes" ? 60 : 3600}
                          step={1}
                          value={heroIntervalValue}
                          onChange={(e) =>
                            updateHeroInterval(Number(e.target.value), heroIntervalUnit)
                          }
                          className="h-9 w-16 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-center text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                        />
                        <select
                          value={heroIntervalUnit}
                          onChange={(e) =>
                            updateHeroInterval(heroIntervalValue, e.target.value as IntervalUnit)
                          }
                          className="h-9 w-28 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                        >
                          <option value="seconds">segundos</option>
                          <option value="minutes">minutos</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setHeroImageIntervalMs(DEFAULT_HERO_IMAGE_INTERVAL_MS)}
                          className="h-9 rounded-lg px-2.5 text-xs font-semibold text-[var(--accent)] underline-offset-4 transition hover:bg-[var(--accent-soft)]"
                        >
                          Restaurar
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        Minimo 10 segundos. Por defecto 5 minutos.
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        Rango: {MIN_HERO_IMAGE_INTERVAL_MS / 1000}s a{" "}
                        {MAX_HERO_IMAGE_INTERVAL_MS / 60_000} min.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
