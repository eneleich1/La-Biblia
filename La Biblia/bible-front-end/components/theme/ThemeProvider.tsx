"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { BookTitleMode } from "@/lib/formatTitle";

export type SiteTheme = "warm" | "blue";
export type BibleIndexMode = "natural" | "grouped";
export type ReadingFontFamily = "default" | "georgia" | "verdana" | "arial" | "times" | "consolas";

export const THEME_STORAGE_KEY = "sot-theme";
export const THEME_COOKIE_KEY = "sot-theme";
export const DEFAULT_THEME: SiteTheme = "blue";
export const BIBLE_INDEX_MODE_STORAGE_KEY = "sot-bible-index-mode";
export const BIBLE_INDEX_MODE_COOKIE_KEY = "sot-bible-index-mode";
export const DEFAULT_BIBLE_INDEX_MODE: BibleIndexMode = "natural";
export const BOOK_TITLE_MODE_STORAGE_KEY = "sot-book-title-mode";
export const BOOK_TITLE_MODE_COOKIE_KEY = "sot-book-title-mode";
export const DEFAULT_BOOK_TITLE_MODE: BookTitleMode = "short";
export const READING_FONT_FAMILY_STORAGE_KEY = "sot-reading-font-family";
export const DEFAULT_READING_FONT_FAMILY: ReadingFontFamily = "default";
export const READING_FONT_SIZE_STORAGE_KEY = "sot-reading-font-size-rem";
export const DEFAULT_READING_FONT_SIZE_REM = 1.12;
export const MIN_READING_FONT_SIZE_REM = 0.9;
export const MAX_READING_FONT_SIZE_REM = 1.45;
export const READING_TEXT_COLOR_STORAGE_KEY = "sot-reading-text-color";
export const DEFAULT_READING_TEXT_COLOR = "var(--text)";
export const RANDOM_VERSE_INTERVAL_STORAGE_KEY = "sot-random-verse-interval-ms";
export const DEFAULT_RANDOM_VERSE_INTERVAL_MS = 60_000;
export const MIN_RANDOM_VERSE_INTERVAL_MS = 5_000;
export const MAX_RANDOM_VERSE_INTERVAL_MS = 60 * 60_000;
export const HERO_IMAGE_INTERVAL_STORAGE_KEY = "sot-hero-image-interval-ms";
export const DEFAULT_HERO_IMAGE_INTERVAL_MS = 5 * 60_000;
export const MIN_HERO_IMAGE_INTERVAL_MS = 10_000;
export const MAX_HERO_IMAGE_INTERVAL_MS = 60 * 60_000;

type ThemeContextValue = {
  theme: SiteTheme;
  setTheme: (t: SiteTheme) => void;
  bibleIndexMode: BibleIndexMode;
  setBibleIndexMode: (mode: BibleIndexMode) => void;
  bookTitleMode: BookTitleMode;
  setBookTitleMode: (mode: BookTitleMode) => void;
  readingFontFamily: ReadingFontFamily;
  setReadingFontFamily: (fontFamily: ReadingFontFamily) => void;
  readingFontSizeRem: number;
  setReadingFontSizeRem: (fontSizeRem: number) => void;
  readingTextColor: string;
  setReadingTextColor: (color: string) => void;
  randomVerseIntervalMs: number;
  setRandomVerseIntervalMs: (intervalMs: number) => void;
  heroImageIntervalMs: number;
  setHeroImageIntervalMs: (intervalMs: number) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): SiteTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "blue" || raw === "warm") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function readStoredBibleIndexMode(): BibleIndexMode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${BIBLE_INDEX_MODE_COOKIE_KEY}=([^;]*)`),
  );
  const raw = match ? decodeURIComponent(match[1]) : null;
  if (raw === "natural" || raw === "grouped") return raw;
  return null;
}

function readStoredBookTitleMode(): BookTitleMode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${BOOK_TITLE_MODE_COOKIE_KEY}=([^;]*)`),
  );
  const raw = match ? decodeURIComponent(match[1]) : null;
  if (raw === "short" || raw === "long") return raw;
  return null;
}

function readStoredReadingFontFamily(): ReadingFontFamily | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(READING_FONT_FAMILY_STORAGE_KEY);
    if (
      raw === "default" ||
      raw === "georgia" ||
      raw === "verdana" ||
      raw === "arial" ||
      raw === "times" ||
      raw === "consolas"
    ) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeReadingFontSize(raw: number) {
  if (!Number.isFinite(raw)) return DEFAULT_READING_FONT_SIZE_REM;
  return Math.min(
    MAX_READING_FONT_SIZE_REM,
    Math.max(MIN_READING_FONT_SIZE_REM, Math.round(raw * 100) / 100),
  );
}

function readStoredReadingFontSize(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(READING_FONT_SIZE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeReadingFontSize(Number(raw));
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeReadingTextColor(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_READING_TEXT_COLOR;
}

function readStoredReadingTextColor(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(READING_TEXT_COLOR_STORAGE_KEY);
    return raw ? normalizeReadingTextColor(raw) : null;
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeRandomVerseInterval(raw: number) {
  if (!Number.isFinite(raw)) return DEFAULT_RANDOM_VERSE_INTERVAL_MS;
  return Math.min(
    MAX_RANDOM_VERSE_INTERVAL_MS,
    Math.max(MIN_RANDOM_VERSE_INTERVAL_MS, Math.round(raw)),
  );
}

function readStoredRandomVerseInterval(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RANDOM_VERSE_INTERVAL_STORAGE_KEY);
    if (!raw) return null;
    return normalizeRandomVerseInterval(Number(raw));
  } catch {
    /* ignore */
  }
  return null;
}

function readStoredHeroImageInterval(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HERO_IMAGE_INTERVAL_STORAGE_KEY);
    if (!raw) return null;
    return normalizeHeroImageInterval(Number(raw));
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeHeroImageInterval(raw: number) {
  if (!Number.isFinite(raw)) return DEFAULT_HERO_IMAGE_INTERVAL_MS;
  return Math.min(
    MAX_HERO_IMAGE_INTERVAL_MS,
    Math.max(MIN_HERO_IMAGE_INTERVAL_MS, Math.round(raw)),
  );
}

function applyTheme(theme: SiteTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.siteTheme = theme;
}

function getReadingFontFamilyValue(readingFontFamily: ReadingFontFamily) {
  return readingFontFamily === "default"
    ? "var(--font-serif), ui-serif, Georgia, serif"
    : readingFontFamily === "georgia"
      ? "Georgia, 'Times New Roman', serif"
      : readingFontFamily === "verdana"
        ? "Verdana, Geneva, sans-serif"
        : readingFontFamily === "arial"
          ? "Arial, Helvetica, sans-serif"
          : readingFontFamily === "times"
            ? "'Times New Roman', Times, serif"
            : "Consolas, 'Courier New', monospace";
}

function applyReadingPreferences({
  readingFontFamily,
  readingFontSizeRem,
  readingTextColor,
}: {
  readingFontFamily: ReadingFontFamily;
  readingFontSizeRem: number;
  readingTextColor: string;
}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--reading-font-family", getReadingFontFamilyValue(readingFontFamily));
  root.style.setProperty("--reading-font-size", `${readingFontSizeRem}rem`);
  root.style.setProperty("--reading-text-color", readingTextColor);
}

function persistTheme(theme: SiteTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${THEME_COOKIE_KEY}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function persistBibleIndexMode(mode: BibleIndexMode) {
  try {
    localStorage.setItem(BIBLE_INDEX_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${BIBLE_INDEX_MODE_COOKIE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function persistBookTitleMode(mode: BookTitleMode) {
  try {
    localStorage.setItem(BOOK_TITLE_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${BOOK_TITLE_MODE_COOKIE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function persistReadingFontFamily(fontFamily: ReadingFontFamily) {
  try {
    localStorage.setItem(READING_FONT_FAMILY_STORAGE_KEY, fontFamily);
  } catch {
    /* ignore */
  }
}

function persistReadingFontSize(fontSizeRem: number) {
  try {
    localStorage.setItem(
      READING_FONT_SIZE_STORAGE_KEY,
      String(normalizeReadingFontSize(fontSizeRem)),
    );
  } catch {
    /* ignore */
  }
}

function persistReadingTextColor(color: string) {
  try {
    localStorage.setItem(READING_TEXT_COLOR_STORAGE_KEY, normalizeReadingTextColor(color));
  } catch {
    /* ignore */
  }
}

function persistRandomVerseInterval(intervalMs: number) {
  try {
    localStorage.setItem(
      RANDOM_VERSE_INTERVAL_STORAGE_KEY,
      String(normalizeRandomVerseInterval(intervalMs)),
    );
  } catch {
    /* ignore */
  }
}

function persistHeroImageInterval(intervalMs: number) {
  try {
    localStorage.setItem(
      HERO_IMAGE_INTERVAL_STORAGE_KEY,
      String(normalizeHeroImageInterval(intervalMs)),
    );
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
  initialBibleIndexMode = DEFAULT_BIBLE_INDEX_MODE,
}: {
  children: React.ReactNode;
  initialTheme?: SiteTheme;
  initialBibleIndexMode?: BibleIndexMode;
}) {
  const [theme, setThemeState] = useState<SiteTheme>(() => readStoredTheme() ?? initialTheme);
  const [bibleIndexMode, setBibleIndexModeState] =
    useState<BibleIndexMode>(initialBibleIndexMode);
  const [bookTitleMode, setBookTitleModeState] =
    useState<BookTitleMode>(DEFAULT_BOOK_TITLE_MODE);
  const [readingFontFamily, setReadingFontFamilyState] = useState<ReadingFontFamily>(
    DEFAULT_READING_FONT_FAMILY,
  );
  const [readingFontSizeRem, setReadingFontSizeState] = useState(DEFAULT_READING_FONT_SIZE_REM);
  const [readingTextColor, setReadingTextColorState] = useState(DEFAULT_READING_TEXT_COLOR);
  const [randomVerseIntervalMs, setRandomVerseIntervalState] = useState(
    () => readStoredRandomVerseInterval() ?? DEFAULT_RANDOM_VERSE_INTERVAL_MS,
  );
  const [heroImageIntervalMs, setHeroImageIntervalState] = useState(
    () => readStoredHeroImageInterval() ?? DEFAULT_HERO_IMAGE_INTERVAL_MS,
  );

  useLayoutEffect(() => {
    const stored = readStoredTheme();
    const nextTheme = stored ?? initialTheme;
    applyTheme(nextTheme);
    persistTheme(nextTheme);
    if (nextTheme !== theme) setThemeState(nextTheme);
  }, [initialTheme, theme]);

  useLayoutEffect(() => {
    const nextMode = readStoredBibleIndexMode() ?? initialBibleIndexMode;
    if (nextMode !== bibleIndexMode) setBibleIndexModeState(nextMode);
  }, [bibleIndexMode, initialBibleIndexMode]);

  useLayoutEffect(() => {
    const nextMode = readStoredBookTitleMode() ?? DEFAULT_BOOK_TITLE_MODE;
    if (nextMode !== bookTitleMode) setBookTitleModeState(nextMode);
  }, [bookTitleMode]);

  useLayoutEffect(() => {
    const nextFamily = readStoredReadingFontFamily() ?? DEFAULT_READING_FONT_FAMILY;
    if (nextFamily !== readingFontFamily) setReadingFontFamilyState(nextFamily);
  }, [readingFontFamily]);

  useLayoutEffect(() => {
    const nextSize = readStoredReadingFontSize() ?? DEFAULT_READING_FONT_SIZE_REM;
    if (nextSize !== readingFontSizeRem) setReadingFontSizeState(nextSize);
  }, [readingFontSizeRem]);

  useLayoutEffect(() => {
    const nextColor = readStoredReadingTextColor() ?? DEFAULT_READING_TEXT_COLOR;
    if (nextColor !== readingTextColor) setReadingTextColorState(nextColor);
  }, [readingTextColor]);

  useEffect(() => {
    applyReadingPreferences({
      readingFontFamily,
      readingFontSizeRem,
      readingTextColor,
    });
  }, [readingFontFamily, readingFontSizeRem, readingTextColor]);

  useLayoutEffect(() => {
    const stored = readStoredRandomVerseInterval();
    const nextInterval = stored ?? DEFAULT_RANDOM_VERSE_INTERVAL_MS;
    if (nextInterval !== randomVerseIntervalMs) {
      setRandomVerseIntervalState(nextInterval);
    }
  }, [randomVerseIntervalMs]);

  useLayoutEffect(() => {
    const stored = readStoredHeroImageInterval();
    const nextInterval = stored ?? DEFAULT_HERO_IMAGE_INTERVAL_MS;
    if (nextInterval !== heroImageIntervalMs) {
      setHeroImageIntervalState(nextInterval);
    }
  }, [heroImageIntervalMs]);

  const setTheme = useCallback((t: SiteTheme) => {
    setThemeState(t);
    applyTheme(t);
    persistTheme(t);
  }, []);

  const setBibleIndexMode = useCallback((mode: BibleIndexMode) => {
    setBibleIndexModeState(mode);
    persistBibleIndexMode(mode);
  }, []);

  const setBookTitleMode = useCallback((mode: BookTitleMode) => {
    setBookTitleModeState(mode);
    persistBookTitleMode(mode);
  }, []);

  const setReadingFontFamily = useCallback((fontFamily: ReadingFontFamily) => {
    setReadingFontFamilyState(fontFamily);
    applyReadingPreferences({
      readingFontFamily: fontFamily,
      readingFontSizeRem,
      readingTextColor,
    });
    persistReadingFontFamily(fontFamily);
  }, [readingFontSizeRem, readingTextColor]);

  const setReadingFontSizeRem = useCallback((fontSizeRem: number) => {
    const nextSize = normalizeReadingFontSize(fontSizeRem);
    setReadingFontSizeState(nextSize);
    applyReadingPreferences({
      readingFontFamily,
      readingFontSizeRem: nextSize,
      readingTextColor,
    });
    persistReadingFontSize(nextSize);
  }, [readingFontFamily, readingTextColor]);

  const setReadingTextColor = useCallback((color: string) => {
    const nextColor = normalizeReadingTextColor(color);
    setReadingTextColorState(nextColor);
    applyReadingPreferences({
      readingFontFamily,
      readingFontSizeRem,
      readingTextColor: nextColor,
    });
    persistReadingTextColor(nextColor);
  }, [readingFontFamily, readingFontSizeRem]);

  const setRandomVerseIntervalMs = useCallback((intervalMs: number) => {
    const nextInterval = normalizeRandomVerseInterval(intervalMs);
    setRandomVerseIntervalState(nextInterval);
    persistRandomVerseInterval(nextInterval);
  }, []);

  const setHeroImageIntervalMs = useCallback((intervalMs: number) => {
    const nextInterval = normalizeHeroImageInterval(intervalMs);
    setHeroImageIntervalState(nextInterval);
    persistHeroImageInterval(nextInterval);
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    [
      bibleIndexMode,
      bookTitleMode,
      heroImageIntervalMs,
      randomVerseIntervalMs,
      readingFontFamily,
      readingFontSizeRem,
      readingTextColor,
      setBibleIndexMode,
      setBookTitleMode,
      setHeroImageIntervalMs,
      setRandomVerseIntervalMs,
      setReadingFontFamily,
      setReadingFontSizeRem,
      setReadingTextColor,
      theme,
      setTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="site-frame-bg flex min-h-screen flex-col overflow-x-hidden text-[var(--text)]">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useSiteTheme must be used within ThemeProvider");
  }
  return ctx;
}
