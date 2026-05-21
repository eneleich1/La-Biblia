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

const STORAGE_KEY = "sot-theme";

type ThemeContextValue = {
  theme: SiteTheme;
  setTheme: (t: SiteTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): SiteTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "blue" || raw === "warm") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>("blue");

  useLayoutEffect(() => {
    const stored = readStoredTheme();
    if (stored) setThemeState(stored);
  }, []);

  const setTheme = useCallback((t: SiteTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  const themeClass = theme === "blue" ? "theme-blue" : "theme-warm";

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={`${themeClass} site-frame-bg flex min-h-screen flex-col overflow-x-hidden text-[var(--text)]`}
      >
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
