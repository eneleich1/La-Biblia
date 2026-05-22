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

export const THEME_STORAGE_KEY = "sot-theme";
export const THEME_COOKIE_KEY = "sot-theme";
export const DEFAULT_THEME: SiteTheme = "blue";

type ThemeContextValue = {
  theme: SiteTheme;
  setTheme: (t: SiteTheme) => void;
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

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: {
  children: React.ReactNode;
  initialTheme?: SiteTheme;
}) {
  const [theme, setThemeState] = useState<SiteTheme>(() => readStoredTheme() ?? initialTheme);

  useLayoutEffect(() => {
    const stored = readStoredTheme();
    const nextTheme = stored ?? initialTheme;
    applyTheme(nextTheme);
    persistTheme(nextTheme);
    if (nextTheme !== theme) setThemeState(nextTheme);
  }, [initialTheme, theme]);

  const setTheme = useCallback((t: SiteTheme) => {
    setThemeState(t);
    applyTheme(t);
    persistTheme(t);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

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
