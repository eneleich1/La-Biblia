"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export type SiteTheme = "warm" | "blue";
export type BibleIndexMode = "natural" | "grouped";

export const THEME_STORAGE_KEY = "sot-theme";
export const THEME_COOKIE_KEY = "sot-theme";
export const DEFAULT_THEME: SiteTheme = "blue";
export const BIBLE_INDEX_MODE_STORAGE_KEY = "sot-bible-index-mode";
export const BIBLE_INDEX_MODE_COOKIE_KEY = "sot-bible-index-mode";
export const DEFAULT_BIBLE_INDEX_MODE: BibleIndexMode = "natural";

type ThemeContextValue = {
  theme: SiteTheme;
  setTheme: (t: SiteTheme) => void;
  bibleIndexMode: BibleIndexMode;
  setBibleIndexMode: (mode: BibleIndexMode) => void;
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

function applyTheme(theme: SiteTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.siteTheme = theme;
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

  const setTheme = useCallback((t: SiteTheme) => {
    setThemeState(t);
    applyTheme(t);
    persistTheme(t);
  }, []);

  const setBibleIndexMode = useCallback((mode: BibleIndexMode) => {
    setBibleIndexModeState(mode);
    persistBibleIndexMode(mode);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, bibleIndexMode, setBibleIndexMode }),
    [bibleIndexMode, setBibleIndexMode, theme, setTheme],
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
